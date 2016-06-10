'use strict';
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
  string
  char
  text
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
class Model {
  constructor(options){

  }
}

module.exports = Model;
module.exports.Model = Model;
module.exports.default = Model;
