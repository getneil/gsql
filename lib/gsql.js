'use strict';
var Promise = require('bluebird')
  , Sequelize = require('sequelize')
  , Model = require('./model.js')
  , ModelManager = require('./model-manager')
  , graphql = require('graphql')
  , GraphQLSchema = graphql.GraphQLSchema
  , GraphQLObjectType = graphql.GraphQLObjectType;

function Gsql(database, username, password, config){
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

  this.modelManager = new ModelManager(this);

}

Gsql.prototype.define = function(modelName, configuration){
  if(!modelName){
    throw 'modelName is not defined.'
  }
  if(!configuration || typeof configuration !== 'object'){
    throw 'Model configuration is not defined.'
  }

  if(configuration && !configuration.attributes){
    throw 'No Model attributes found in the configuration.'
  }

  Object.keys(configuration.attributes).forEach(function(key){
    if(Object.keys(configuration.attributes[key]).find((item)=> item === 'type') && configuration.attributes[key].type === undefined){
      throw `Object(${modelName}) attribute(${key}) has an undefined type`;
    }
  });

  if(this.models[modelName]){
    throw `Object(${modelName}) has been defined twice.`;
  }else{
    this.models[modelName] = this.modelManager.register(modelName,configuration); // only used for creating the association structure
  }
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
