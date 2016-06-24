'use strict';

var Promise = require('bluebird')
  , Sequelize = require('sequelize')
  , Model = require('./model.js')
  , tools = require('./tools.js');

const graphql = require('graphql')
  , GraphQLList = graphql.GraphQLList
  , GraphQLObjectType = graphql.GraphQLObjectType;

const graphqlSequelize = require('graphql-sequelize')
  , defaultListArgs = graphqlSequelize.defaultListArgs
  , defaultArgs = graphqlSequelize.defaultArgs
  , resolver = graphqlSequelize.resolver;

function ModelManager(models, sequelizeConnection){

  this.associations = [];
  this.models = models || {};
  this.connection = sequelizeConnection;

  this.associationDictionary = {};
}

/*
  creates a Gsql.Model with a defined sequelize object
    it will also be used later to initialize the GraphQL objects
*/
ModelManager.prototype.define = function(modelName,configuration){
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
    // this.models[modelName] = this.modelManager.register(modelName,configuration); // only used for creating the association structure
    this.models[modelName] = new Model(modelName,configuration,this.connection);
  }
  // return new Model(modelName,configuration,this.connection);
}

/*
  creates the database tables and associations(fk)
  uses sequelize.sync
*/
ModelManager.prototype.initializeDatabase = function(config){
  let mm = this;
  return new Promise(function(resolve,reject){
    var objectsSyncing = []
      , syncSequence = tools.getSyncSequence(mm.models);

    Promise.mapSeries(syncSequence, function(objectName) {
      return mm.models[objectName].sequelize.sync({force:true})
    }).then(function(total) {
      resolve(total);
    }).catch(function(err){
      reject(err);
    })
  });
}

/*
  create and record the sequelize relationships
    hasMany, belongsToMany, belongsTo, hasOne
    will be used later for graphql resolvers
*/
ModelManager.prototype.associateObjects = function(){
  let sortingPriority = tools.getSyncSequence(this.models)
    , dict = this.associationDictionary
    , sequelizeModels = {}
    , mm = this
    , relTasks = [];

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

    let Source = sequelizeModels[task.sourceName]
      , Target = sequelizeModels[task.targetName];

    if(!Source) throw `${task.sourceName} model does not exist.`;
    if(!Target) throw `${task.targetName} model does not exist.`;

    if(preprocess[task.type]) task.config = preprocess[task.type](task.config);

    dict[newName] = Source[task.type](Target,task.config);
  });

   // should enable users to manually assemble this?
   // or create a process queue that users would follow or execute after allobjects have been defined
  this.assembleGraphQLObjects();
  return this.associationDictionary;
}

/*
  assumes that all sequelize object associations have been finished already
  so that proper graphql objects
*/
ModelManager.prototype.assembleGraphQLObjects = function(){
  var models = this.models
    , associations = this.associationDictionary;
  Object.keys(this.models).forEach((objectName)=>{
    models[objectName].createGraphQLInstance(models, associations);
  })
}

/*
 move to gsql main instead of here
*/
ModelManager.prototype.getGraphqlQueryFields = function(config){
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

module.exports = Promise.ModelManager = ModelManager;
module.exports.ModelManager = ModelManager;
module.exports.default = ModelManager;
