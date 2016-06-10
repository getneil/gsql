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
      type: 'enum',
      enum: ['admin', 'regular'], // or { admin: 'admin', regular: 'regular'} to be converted to graphQL option
      description: 'An alias for ObjectA',
    },
    userId: {
      type: 'integer',
      object: 'User'
    }
  }
}
