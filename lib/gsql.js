'use strict';
var Promise = require('bluebird')
  , Sequelize = require('sequelize')
  , Model = require('./model.js')
  , ModelManager = require('./model-manager')
  , graphql = require('graphql')
  , GraphQLSchema = graphql.GraphQLSchema
  , GraphQLObjectType = graphql.GraphQLObjectType;

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

Gsql.prototype.defineGraphqlSchema = function(config){

  if(!config || !Object.keys(config).length) throw 'schema configuration not provided!';
  let fields = this.modelManager.getGraphqlQueryFields(config);
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
