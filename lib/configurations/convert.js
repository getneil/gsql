'use strict';

// import {
//   GraphQLInputType,
//   GraphQLObjectType,
//   GraphQLNonNull,
//   GraphQLInt,
//   GraphQLString,
//   GraphQLList,
//   GraphQLSchema,
//   GraphQLEnumType,
//   GraphQLBoolean,
//   GraphQLFloat
// } from 'graphql';

const graphqlToSequelize = {
  GraphQLString: ['string','char','text','uuid','uuidv1','uuidv4','date'],
  GraphQLInt: ['integer','bigint','double'],
  GraphQLFloat: ['float','real'],
  GraphQLBoolean: ['boolean'],
  // leave this out for now, it will require an extra config from the model definition to make sure of the structure expected
  // ObjectType: ['json','jsonb']
};

const sequelizeToGraphql = {};

Object.keys(graphqlToSequelize).forEach((GraphQLType)=>{
  graphqlToSequelize[GraphQLType].forEach((sequelizeType)=>{
    sequelizeToGraphql[sequelizeType] = GraphQLType;
  })
})

module.exports = {
  graphqlToSequelize: graphqlToSequelize,
  sequelizeToGraphql: sequelizeToGraphql
}
