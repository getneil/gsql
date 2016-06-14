'use strict';
const graphql = require('graphql');
const graphSequelize = require('graphql-sequelize'),
  resolver = graphSequelize.resolver,
  defaultListArgs = graphSequelize.defaultListArgs,
  defaultArgs = graphSequelize.defaultArgs;
var Promise = require('bluebird');
/*
const bcrypt = require('bcrypt');
const encryptPassword = (user, options) => {
  if(options){
    console.log(options);
  }
  if(user.password && !(/\$2a/.test(user.password)) ){
    var salt = bcrypt.genSaltSync(10);
    user.password = bcrypt.hashSync(user.password, salt);
  }
}
module.exports = {
  description: 'Refers to the person that has access to 4syt and its credentials',
  // args: defaultArgs(sequelizedModel)
  // args: defaultArgs(sequelizedModel, {this.args})
  attributes: { // ()=> { return { } }
    id: {
      type: 'integer',
      description: 'description', //optional
      primaryKey: true, // sequelize
      autoIncrement: true // sequelize
    },
    email: {
      type: 'string',
      sequelizeType: 'text', // IF THERE IS a need for difference between graphql type and sequelize type
      graphqlType: 'string',
      description: 'description',
      unique: true,
      validate: {
        isEmail: true
      }
    },
    password: {
      type: 'string',
      validate:{
        notEmpty: true
      }
    },
    active: {
      type: 'boolean',
      description: 'description',
      defaultValue: true
    },
    roles: {
      list: 'UserRole',// means a GraphQLList and a sequelize hasMany
      via: 'userId',
      resolveConfig: { // extra config for resolve(models.User.UserRoles, {separate:false})
        separate: false
      }
    }
  },
  config:{
    tableName: 'users',
    freezeTableName: true,
    hooks:{
      beforeUpdate: encryptPassword,
      beforeCreate: encryptPassword
    }
  }

}

*/

const SequelizeTypeDictionary = {
  String: {
    seqeuelizeTypes: [
      'string',
      'char',
      'text',
      'uuid',
      'uuidv1',
      'uuidv4'
    ]
  },
  Int: {
    seqeuelizeTypes: [
      'integer',
      'bigint',
      'double'
    ]
  },
  Float: {
    seqeuelizeTypes: [
      'float',
      'real',

    ]
  },
  Boolean:{
    seqeuelizeTypes: [
      'boolean'
    ]
  },
  ObjectType:{
    seqeuelizeTypes: [
      'json',
      'jsonb'
    ]
  }
}

const tools = require('./tools.js');


function defineSequelizeAttributes(attributes){

  let redefinedAttributes = {};

  Object.keys(attributes).forEach((k)=>{
    if(attributes[k].type){
      redefinedAttributes[k] = attributes[k];
    }
  })

  return redefinedAttributes;
}

function defineRelationships(sourceName, attributes){
  // belongsTo, hasMany, hasOne, belongsToMany

  function getBase(type,attr){
    return {
      sourceName: sourceName,
      type: type,
      targetName: attr[type]
    }
  }

  let associations = [],
    relKeys = {
      hasMany: function(fieldName,attr){
        var base = getBase('hasMany',attr);
        base.config = {
          foreignKey: attr.foreignKey || (attr.hasMany+'Id')
        }
        return base;
      },
      hasOne: function(fieldName,attr){
        var base = getBase('hasOne',attr);
        base.config = {
          foreignKey: fieldName
        }
        return base;

      },
      belongsTo: function(fieldName,attr){
        var base = getBase('belongsTo',attr);

        base.config = {
          foreignKey: fieldName
        }

        return base;

      },
      belongsToMany: function(fieldName,attr){
        var base = getBase('belongsToMany',attr);

        base.config = {
          throughName: attr.through
        }
        return base;

      }
    }

  Object.keys(attributes).forEach((k)=>{
    var attr = attributes[k];

    for(var relKey of Object.keys(relKeys)){
      if(attr[relKey]){
        associations.push(relKeys[relKey](k,attr));
        break;
      }
    }

  });
  return associations;
}

function getDependency(attributes){
  let dependencies = [];

  let depKeys = ['belongsTo','hasOne'];

  Object.keys(attributes).forEach((k)=>{
    var relKey = -1;
    depKeys.forEach((depKey,i)=>{
      if(relKey === -1){
        if(Object.keys(attributes[k]).indexOf(depKey) > -1){
          relKey = i;
        }
      }
    });
    if(attributes[k][depKeys[relKey]]){
      dependencies.push(attributes[k][depKeys[relKey]]);
    }
  })
  return dependencies
}

function defineGraphqlFields(attributes){

  return {
    id: {
      type: new graphql.GraphQLNonNull(graphql.GraphQLInt)
    },
  }
}

class Model {
  constructor(name,modelConfiguration,sequelizeConnection){

    let attributes = defineSequelizeAttributes(modelConfiguration.attributes);
    let tableName = tools.camelTo_(name).toLowerCase();
    this.sequelize = sequelizeConnection.define(tableName,attributes,modelConfiguration.config);
    this.association = defineRelationships(name,modelConfiguration.attributes);
    this.requires = getDependency(modelConfiguration.attributes);
    this.raw = modelConfiguration;
    this.name = name;
  }

  createGraphQLInstance(){
    let newObject = {
      name: this.name,
      args: defaultArgs(this.sequelize),
      fields: ()=> (defineGraphqlFields())
    }
    if(this.raw.description) newObject.description = this.raw.description;

    this.graphql = new graphql.GraphQLObjectType(newObject);
  }
}
module.exports = Promise.Model = Model;
module.exports.Model = Model;
module.exports.default = Model;
module.exports.defineSequelizeAttributes = defineSequelizeAttributes;
module.exports.getDependency = getDependency;
module.exports.defineRelationships = defineRelationships;
module.exports.defineGraphqlFields = defineGraphqlFields;
