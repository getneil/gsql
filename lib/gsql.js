'use strict';
var Promise = require('bluebird')
  , Sequelize = require('sequelize');
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
  }

}

module.exports = Promise.Gsql = Gsql;
module.exports.Gsql = Gsql;
module.exports.default = Gsql;
