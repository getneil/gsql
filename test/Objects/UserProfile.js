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
    userId:{
      type: 'integer',
      description: 'Identifier for ObjectAs',
      primaryKey: true,
      autoIncrement: true
    },
    firstName: {
      type: 'string',
      description: 'An alias for ObjectA'
    },
    lastName: {
      type: 'string',
      description: 'An alias for ObjectA'
    }
  }
}
