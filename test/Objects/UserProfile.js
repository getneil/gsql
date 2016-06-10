'use strict';

module.exports = {
  description: 'Details of the user account',
  attributes: {
    id:{
      type: 'integer',
      description: 'Identifier for Profile',
      primaryKey: true,
      autoIncrement: true
    },
    firstName: {
      type: 'string',
      description: 'FirstName of User'
    },
    lastName: {
      type: 'string',
      description: 'LastName of User'
    }
  }
}
