'use strict';

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

function getDependency(attributes){
  let dependencies = [];

  Object.keys(attributes).forEach((k)=>{
    if(attributes[k].object){
      dependencies.push(attributes[k].object);
    }
  })
  return dependencies
}

class Model {
  constructor(name,modelConfiguration,sequelizeConnection){

    let attributes = defineSequelizeAttributes(modelConfiguration.attributes);
    let tableName = tools.camelTo_(name).toLowerCase();
    this.sequelize = sequelizeConnection.define(tableName,attributes,modelConfiguration.config);

    this.requires = getDependency(modelConfiguration.attributes);
  }
}
module.exports = Promise.Model = Model;
module.exports.Model = Model;
module.exports.default = Model;
module.exports.defineSequelizeAttributes = defineSequelizeAttributes;
module.exports.getDependency = getDependency;
