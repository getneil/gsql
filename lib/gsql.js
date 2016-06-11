'use strict';
var Promise = require('bluebird')
  , Sequelize = require('sequelize')
  , Model = require('./model.js');

class Gsql {
  // a configuration to intialize sequelize
  constructor(database, username, password, config){
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
  }

  /*
  modelName = string
  configuration = {
    attributes:{
      field1:{
        type: SEQUELIZE.TYPE
      }
    },
    config:{
      SEQUELIZE CONFIG

    }
  }
  */
  define(modelName, configuration){

    if(!modelName){
      throw 'modelName is not defined.'
    }
    if(!configuration || typeof configuration !== 'object'){
      throw 'Model configuration is not defined.'
    }

    if(configuration && !configuration.attributes){
      throw 'No Model attributes found in the configuration.'
    }

    if(!this.models){
      this.models = {};
    }

    Object.keys(configuration.attributes).forEach(function(key){
      if(Object.keys(configuration.attributes[key]).find((item)=> item === 'type') && configuration.attributes[key].type === undefined){
        throw `Object(${modelName}) attribute(${key}) has an undefined type`;
      }
    });

    if(this.models[modelName]){
      throw `Object(${modelName}) has been defined twice.`;
    }else{
      this.models[modelName] = new Model(modelName,configuration,this.connection);
    }

  }

  linkObjects(){

  }
  defineGraphqlSchema(config){

  }
}

module.exports = Promise.Gsql = Gsql;
module.exports.Gsql = Gsql;
module.exports.default = Gsql;
