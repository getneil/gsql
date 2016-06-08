var Gsql = require('../'),
  gsql = new Gsql('database', 'username', 'password', {
    dialect: 'sqlite',
    storage: 'memory'
  });

const User = gsql.define('User',{
  description: 'Details of the user account',
  attributes: {
    id:{
      type: 'integer',
      description: 'Identifier for ObjectAs',
      primaryKey: true,
      autoIncrement: true
    },
    email: {
      type: 'string',
      description: 'An alias for ObjectA',
      unique: true,
      validate: {
        isEmail: true
      }
    },
    password: {
      type: 'string',
      description: 'Password for this account',
      validate: {
        notEmpty: true
      }
    }
  }
});

module.exports = {
  gi: gsql, // GsqlInstance
  models:{
    User: User
  }
}
