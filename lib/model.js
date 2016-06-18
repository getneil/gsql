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
          foreignKey: attr.foreignKey
        }
        return base;

      },
      belongsTo: function(fieldName,attr){
        var base = getBase('belongsTo',attr);

        base.config = {
          foreignKey: fieldName
          // as: attr.as || fieldName || attr.targetName.toLowerCase()  // add this in the future
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

  let depKeys = ['belongsTo']; // removed hasOne

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

const convert = require('./configurations/convert.js');

function getGraphqlType(config){
  var rkey = config.type.key.toLowerCase()
    , rkeyTest = rkey.split(" ");
  if(rkeyTest.length > 1){
    rkey = rkeyTest[0];
  }
  var type = graphql[convert.sequelizeToGraphql[rkey]]
    , nonNull = false;

  // detect if non null add more tests here like check validation structure
  if(config.primaryKey) nonNull =true;

  if(type === undefined){
    // var RGBType = new GraphQLEnumType({
    //   name: 'RGB',
    //   values: {
    //     RED: { value: 0 },
    //     GREEN: { value: 1 },
    //     BLUE: { value: 2 }
    //   }
    // });
    var values = {}
    config.values.forEach((k)=>{
      values[k] = { value: k};
    });
    type = new graphql.GraphQLEnumType({
      name: `${config.Model.name}_${config.fieldName}`,
      values: values
    });
  }
  return nonNull? (new graphql.GraphQLNonNull(type)):type
}

function defineGraphqlFields(objectName, attributes, models, associations){
  var fields = {};
  // return {
  //   id: {
  //     type: new graphql.GraphQLNonNull(graphql.GraphQLInt)
  //   },
  // }
  if(!attributes || !Object.keys(attributes)) throw 'no attributes defined to create graphql fields';

  Object.keys(attributes).forEach((field)=>{
    // decide here if wehter object is basic typed or not
    let fieldConfiguration = attributes[field];

    if(fieldConfiguration.type){
      fields[field] = {}

      if(fieldConfiguration.description) fields[field].description = fieldConfiguration.description;
      //if(field==='type') console.log(field,fieldConfiguration.type);
      if(fieldConfiguration.type){
        fields[field].type = getGraphqlType(fieldConfiguration);
      }
    }else{
      //
      // relationship has to be established
      var type = null
        , relName = null
        , relationship = null;

      if(fieldConfiguration.hasOne){

        type = models[fieldConfiguration.hasOne];
        relName = `${objectName} hasOne ${fieldConfiguration.hasOne}`;
        relationship = associations[relName];

        if(!type) throw `${objectName}.${field} has no ${fieldConfiguration.hasOne} to bind to.`;
        if(!relationship) throw relName+' association was not found.';

        fields[field] = {
          type: type.graphql,
          //args: defaultArgs(type.sequelize),
          resolve: resolver(relationship)
        };
      }else if(fieldConfiguration.hasMany){

        type = models[fieldConfiguration.hasMany];
        relName = `${objectName} hasMany ${fieldConfiguration.hasMany}`;
        relationship = associations[relName];
        if(!type) throw `${objectName}.${field} has no ${fieldConfiguration.hasMany} to bind to.`;
        if(!relationship) throw relName+' association was not found.';

        fields[field] = {
          type: new graphql.GraphQLList(type.graphql),
          args: defaultListArgs(type.sequelize),
          resolve: resolver(relationship)
        };
      }else if(fieldConfiguration.belongsToMany){

        type = models[fieldConfiguration.belongsToMany];
        relName = `${objectName} belongsToMany ${fieldConfiguration.belongsToMany}`;
        relationship = associations[relName];
        if(!type) throw `${objectName}.${field} has no ${fieldConfiguration.belongsToMany} to bind to.`;
        if(!relationship) throw relName+' association was not found.';

        fields[field] = {
          type: new graphql.GraphQLList(type.graphql),
          args: defaultListArgs(type.sequelize),
          resolve: resolver(relationship)
        };

      }

    }

  })

  return fields;
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

  createGraphQLInstance(models, associations){

    let newObject = {
      name: this.name,
      args: defaultArgs(this.sequelize),
      fields: ()=> (defineGraphqlFields(this.name, this.raw.attributes, models, associations ))
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
