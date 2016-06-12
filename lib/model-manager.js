'use strict';

var Promise = require('bluebird')
  , Sequelize = require('sequelize')
  , Model = require('./model.js')
  , topoSort = require('toposort-class');

class ModelManager {
  constructor(gsqlObject){
    if(!gsqlObject.models){
      gsqlObject.models = {};
    }
    this.associations = [];
    this.models = gsqlObject.models;
    this.connection = gsqlObject.connection;
  }
  register(modelName,configuration){
    return new Model(modelName,configuration,this.connection);
  }

  getSyncSequence(){
    if(this.sequelizeSyncSequence){
      return this.sequelizeSyncSequence;
    }else{
      let newSort = new topoSort(),
        models = this.models;

      Object.keys(models).forEach((objectName)=>{
        newSort.add(objectName, models[objectName].requires)
      })
      return this.sequelizeSyncSequence = newSort.sort().reverse();
    }
  }
  initializeDatabase(config){ // config maybe has initial seed data
    let mm = this;
    return new Promise(function(resolve,reject){
      var objectsSyncing = [];
      mm.sequelizeSyncSequence.forEach((k)=>{

      })

      Promise.mapSeries(mm.sequelizeSyncSequence, function(objectName) {
        return mm.models[objectName].sequelize.sync({force:true})
      }).then(function(total) {
          //Total is 30

          resolve(total);
      });
    });
  }

  associateObjects(){
    let sortingPriority = this.getSyncSequence();

    this.associationList = [
      {
        sourceName: 'User',
        source: this.models.User,
        type: 'hasMany',
        targetName: 'UserRole',
        target: this.models.UserRole,
        config: {
          via: 'userId'
        }
      },
      {
        sourceName: 'User',
        source: this.models.User,
        type: 'hasOne',
        targetName: 'UserProfile',
        target: this.models.UserProfile,
        config: {
          as: 'userId'
        }
      }
    ];

    return this.associationList;
  }
}

module.exports = Promise.ModelManager = ModelManager;
module.exports.ModelManager = ModelManager;
module.exports.default = ModelManager;
