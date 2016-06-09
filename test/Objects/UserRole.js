'use strict';

module.exports = {
  description: 'Role available to a user',
  attributes: {
    id:{
      type: 'integer',
      description: 'Identifier for ObjectAs',
      primaryKey: true,
      autoIncrement: true
    },
    type: {
      type: 'string',
      description: 'An alias for ObjectA',
      unique: true,
      validate: {
        isEmail: true
      }
    },
    userId: {
      type: 'integer'
    }
  }
}
