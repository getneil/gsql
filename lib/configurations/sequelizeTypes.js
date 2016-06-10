'use strict';

import {
  GraphQLInputType,
  GraphQLObjectType,
  GraphQLNonNull,
  GraphQLInt,
  GraphQLString,
  GraphQLList,
  GraphQLSchema,
  GraphQLEnumType,
  GraphQLBoolean,
  GraphQLFloat
} from 'graphql';

const GraphQLTypesDictionary = {
  InputType: [],
  ObjectType: [],
  Int: [],
  String: [],
  List: [],
  Boolean: [],
  Float: []
}
/*
Graphql Types
  GraphqlInt
  GraphqlFloat
  GraphqlString
  GraphqlBoolean
  GraphqlID
  GraphQLEnumType
  GraphQLInputObjectType - json
  GraphQLList
Sequelize Types:

  integer
  bigint
  float
  real
  double
  decimal
  boolean
  time
  date
  dateonly
  hstore
  json
  jsonb
  now
  blob
  range
  uuid
  uuidv1
  uuidv4
  virtual
  enum
  array(Sequelize.TYPE)
  geometry
  geography
*/
module.exports = {
  integer:{
    graphql: ''
  }
}
