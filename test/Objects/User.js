'use strict';

module.exports = {
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
}
