'use strict';

module.exports = {
  description: 'Details of the user account',
  attributes: {
    id:{
      type: 'integer',
      primaryKey: true,
      autoIncrement: true
    },
    name: {
      type: 'string'
    },
    members: {
      list: 'User',
      through: 'Membership'
    }
  }
}
