'use strict';

var Promise = require('bluebird')
  , Sequelize = require('sequelize');

class ModelManager {
  constructor(gsqlObject){
    if(!gsqlObject.models){
      gsqlObject.models = {};
    }
    this.models = gsqlObject.models;
  }
  register(model){

  }
}

module.exports = Promise.ModelManager = ModelManager;
module.exports.ModelManager = ModelManager;
module.exports.default = ModelManager;
