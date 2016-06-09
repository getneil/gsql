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
    name: {
      type: 'string',
      description: 'An alias for ObjectA',
      unique: true,
      validate: {
        isEmail: true
      }
    },
    users: {
      // many is to many should use Membership Model
    }
  }
}
