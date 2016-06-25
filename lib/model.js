'use strict';
const graphql = require('graphql');
const graphSequelize = require('graphql-sequelize'),
  resolver = graphSequelize.resolver,
  defaultListArgs = graphSequelize.defaultListArgs,
  defaultArgs = graphSequelize.defaultArgs;

const Promise = require('bluebird');

const tools = require('./tools.js');

/*
  returns the properties that dont have a type defined
  to prepare the initial parts of the Sequelize Model
*/
function defineSequelizeAttributes(attributes){

  let redefinedAttributes = {};

  Object.keys(attributes).forEach((k)=>{
    if(attributes[k].type){
      redefinedAttributes[k] = attributes[k];
    }
  })

  return redefinedAttributes;
}

/*
  prepare a list of expected Source and Targets to be associated with their association type
  will loop through this list with all the models associations after all the models have been defined
*/
function defineRelationships(sourceName, attributes){


  let getBase = function(type,attr){
    return {
      sourceName: sourceName,
      type: type,
      targetName: attr[type]
    }
  }

  let associations = [],
    relationshipKeys = {
      hasMany: function(fieldName,attr){
        var base = getBase('hasMany',attr);
        base.config = {
          foreignKey: attr.foreignKey || (attr.hasMany+'Id'),
          as: fieldName
        }
        return base;
      },
      hasOne: function(fieldName,attr){
        var base = getBase('hasOne',attr);
        base.config = {
          foreignKey: attr.foreignKey,
          //as: attr.as || fieldName
        }
        return base;

      },
      belongsTo: function(fieldName,attr){
        var base = getBase('belongsTo',attr);

        base.config = {
          foreignKey: fieldName,
          //as: fieldName
        }
        return base;

      },
      belongsToMany: function(fieldName,attr){
        var base = getBase('belongsToMany',attr);

        base.config = {
          throughName: attr.through,
          as: attr.as || fieldName
        }
        return base;

      }
    }

  Object.keys(attributes).forEach((k)=>{
    var attr = attributes[k];

    for(var relKey of Object.keys(relationshipKeys)){
      if(attr[relKey]){
        associations.push(relationshipKeys[relKey](k,attr));
        break;
      }
    }

  });
  return associations;
}

/*
  determines the model's dependency
  its checking belongsTo for now
*/
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

/*
  creates the graphql field representation of the sequelize attribute
*/
function getGraphqlType(config){

  var rkey = config.type.key.toLowerCase() // sequelize.type
    , rkeyTest = rkey.split(" "); // this is being done because Sequelize is converting "double" to "double precision"

  if(rkeyTest[1]) rkey = rkeyTest[0];

  var type = graphql[convert.sequelizeToGraphql[rkey]]
    , nonNull = false;

  // detect if non null add more tests here like check validation structure
  if(config.primaryKey) nonNull =true;

  if(type === undefined){
    // used for Enum type for now
    // need more ways of tests here defined by Sequelize structure

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
    /*
      should be able to use
      config.values = ['typeA', 'typeB'] not just Sequelize.ENUM(['typeA','typeB'])
    */
    type = new graphql.GraphQLEnumType({
      name: `${config.Model.name}_${config.fieldName}`,
      values: values
    });
  }
  return nonNull ? (new graphql.GraphQLNonNull(type)) : type;
}

/*
  converts sequelize.attributes to graphql.fields
*/
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

    // basic typed like string, int, float, boolean
    if(fieldConfiguration.type){
      fields[field] = {}

      if(fieldConfiguration.description) fields[field].description = fieldConfiguration.description;
      //if(field==='type') console.log(field,fieldConfiguration.type);
      if(fieldConfiguration.type){
        fields[field].type = getGraphqlType(fieldConfiguration);
      }

    // user defined types this can be models or custom resolvers
    }else{

      // relationship has to be established
      var type = null
        , relName = null
        , relationship = null
        , relationships = [
          'hasOne',
          'hasMany',
          'belongsToMany'
        ],
        relationshipType;

      // determines what type of relationship this object has based on relationships
      relationships.forEach(function(r,i){
        if(!relationshipType && Object.keys(fieldConfiguration).indexOf(r)>-1 ) relationshipType = r;
      });

      // has a relationship towards another Model or User Defined type
      if(relationshipType){
        type = fieldConfiguration[relationshipType];
        relName = `${objectName} ${relationshipType} ${fieldConfiguration[relationshipType]}`;
        relationship = associations[relName];

        if(!relationship) throw relName+' association was not found.';

        type = models[type];

        var graphqlObjectType =  type.graphql,
          isList = false;

        if(['hasMany','belongsToMany'].indexOf(relationshipType)>-1){
          isList = true;
          graphqlObjectType = new graphql.GraphQLList(type.graphql)
        }

        fields[field] = {
          type : graphqlObjectType,
          resolve: resolver(relationship)
        }

        if(isList) fields[field].args = defaultListArgs(type.sequelize);


      // simple custom resolvers
      }else{
        /*
          Sequelize.VIRTUAL or
          GraphqlQL custom resolvers will be constructed here
        */
      }

    }

  })

  return fields;
}

function Model(name,modelConfiguration,sequelizeConnection){
  this.name = name;

  let attributes = defineSequelizeAttributes(modelConfiguration.attributes);

  let tableName = tools.camelTo_(name).toLowerCase();

  this.sequelize = sequelizeConnection.define(tableName,attributes,modelConfiguration.config);
  this.association = defineRelationships(name,modelConfiguration.attributes);

  // dependency of this Model from other models < parent, sibling > relationships
  this.requires = getDependency(modelConfiguration.attributes);

  // the models as defined by the user that is the basis of sequelize models and graphql objects
  this.raw = modelConfiguration;


}

Model.prototype.createGraphQLInstance = function(models, associations){

  let newObject = {
    name: this.name,
    args: defaultArgs(this.sequelize),
    fields: ()=> (defineGraphqlFields(this.name, this.raw.attributes, models, associations ))
  }
  if(this.raw.description) newObject.description = this.raw.description;
  this.graphql = new graphql.GraphQLObjectType(newObject);
}

module.exports = Promise.Model = Model;
module.exports.Model = Model;
module.exports.default = Model;
module.exports.defineSequelizeAttributes = defineSequelizeAttributes;
module.exports.getDependency = getDependency;
module.exports.defineRelationships = defineRelationships;
module.exports.defineGraphqlFields = defineGraphqlFields;
