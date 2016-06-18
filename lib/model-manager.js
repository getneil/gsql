'use strict';

var Promise = require('bluebird')
  , Sequelize = require('sequelize')
  , Model = require('./model.js')
  , topoSort = require('toposort-class');

const graphql = require('graphql');
const graphqlSequelize = require('graphql-sequelize');

const GraphQLList = graphql.GraphQLList;
const GraphQLObjectType = graphql.GraphQLObjectType;

const resolver = graphqlSequelize.resolver;
const defaultListArgs = graphqlSequelize.defaultListArgs;
const defaultArgs = graphqlSequelize.defaultArgs;

class ModelManager {
  constructor(gsqlObject){
    if(!gsqlObject.models){
      gsqlObject.models = {};
    }
    this.associations = [];
    this.models = gsqlObject.models;
    this.connection = gsqlObject.connection;

    this.associationDictionary = {};
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

  /*
    loop throught the models
    get the .association and loop through it
    generate the relationship object then store in this.associations w/ key [ SourceName relType TargetObject  ]
  */
  associateObjects(){
    let sortingPriority = this.getSyncSequence(),
      dict = this.associationDictionary,
      sequelizeModels = {},
      mm = this,
      relTasks = [];


    Object.keys(this.models).forEach((modelName)=>{
      relTasks = relTasks.concat(mm.models[modelName].association);
      sequelizeModels[modelName] = mm.models[modelName].sequelize;
    });

    let preprocess = {
      belongsToMany: function(config){
        if(config.throughName){
          config.through = sequelizeModels[config.throughName];
          delete config.throughName;
        }
        return config;
      }
    }

    relTasks.forEach((task)=>{
      let newName = task.sourceName+' '+task.type+' '+task.targetName;
      if(dict[newName]) throw `${newName} has been defined already`;

      let Source = sequelizeModels[task.sourceName],
        Target = sequelizeModels[task.targetName];

      if(!Source) throw `${task.sourceName} model does not exist.`
      if(!Target) throw `${task.targetName} model does not exist.`

      if(preprocess[task.type]){
        task.config = preprocess[task.type](task.config);
      }

      dict[newName] = Source[task.type](Target,task.config);

    });

    this.assembleGraphQLObjects();
    return this.associationDictionary;
  }
  assembleGraphQLObjects(){
    var models = this.models
      , associations = this.associationDictionary;
    Object.keys(this.models).forEach((objectName)=>{
      models[objectName].createGraphQLInstance(models, associations);
    })
  }

  getGraphqlQueryFields(config){
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

      var model = this.models[type];

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
}

module.exports = Promise.ModelManager = ModelManager;
module.exports.ModelManager = ModelManager;
module.exports.default = ModelManager;
