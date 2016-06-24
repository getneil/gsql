'use strict';
var Promise = require('bluebird')
  , Sequelize = require('sequelize')
  , Model = require('./model.js')
  , ModelManager = require('./model-manager')
  , graphql = require('graphql')
  , GraphQLSchema = graphql.GraphQLSchema
  , GraphQLList = graphql.GraphQLList
  , GraphQLObjectType = graphql.GraphQLObjectType;

const graphqlSequelize = require('graphql-sequelize')
  , defaultListArgs = graphqlSequelize.defaultListArgs
  , defaultArgs = graphqlSequelize.defaultArgs
  , resolver = graphqlSequelize.resolver;

function Gsql(database, username, password, config){

  this.models = {}

  if(!database){
    throw 'data is not defined.';
  }
  if(!username){
    throw 'username is not defined.';
  }
  if(!password){
    throw 'password is not defined.';
  }
  this.connection = new Sequelize(database,username,password,config);

  this.modelManager = new ModelManager(this.models, this.connection);

  this.define = this.modelManager.define;
}

/*
  creates graphql.schema fields based on user defined configuration
*/
function getGraphqlQueryFields(models, config){
  let qf = {}
    , fields = Object.keys(config);

  if(!fields.length) throw 'no fields provided to create graphql query fields';

  for(var fieldIndex in fields){
    var field = fields[fieldIndex]
      , type = config[field].type
      , isList = config[field].list;
    if(!type){
      throw `no expected graphql type for ${field} field.`;
      break;
    }

    var model = models[type];

    if(!model){
      throw `Expected ${type} Model not found for ${field} field.`;
      break;
    }

    var ntype = (isList? new GraphQLList(model.graphql) : model.graphql)

    qf[field] = {
      type: ntype,
      args: (isList? defaultListArgs() : defaultArgs(model.sequelize)),
      resolve: (isList? resolver(model.sequelize) : resolver(model.sequelize, {include:false})  )
    }
  }

  return qf;
}

Gsql.prototype.defineGraphqlSchema = function(config){

  if(!config || !Object.keys(config).length) throw 'schema configuration not provided!';
  let fields = getGraphqlQueryFields(this.models, config);
  this.graqphlSchema = new GraphQLSchema({
    query: new GraphQLObjectType({
      name: 'RootQueryType',
      fields:fields
    })
  })
  return this.graqphlSchema;
}

module.exports = Promise.Gsql = Gsql;
module.exports.Gsql = Gsql;
module.exports.default = Gsql;
module.exports.getGraphqlQueryFields = getGraphqlQueryFields;
