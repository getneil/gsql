'use strict';

var Promise = require('bluebird')
  , Sequelize = require('sequelize')
  , topoSort = require('toposort-class');

class ModelManager {
  constructor(gsqlObject){
    if(!gsqlObject.models){
      gsqlObject.models = {};
    }
    this.models = gsqlObject.models;
  }
  register(model){

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
}

module.exports = Promise.ModelManager = ModelManager;
module.exports.ModelManager = ModelManager;
module.exports.default = ModelManager;
