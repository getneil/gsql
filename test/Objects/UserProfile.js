'use strict';
var Sequelize = require('sequelize');

module.exports = {
  description: 'Details of the user account',
  attributes: {
    id:{
      type: Sequelize.INTEGER,
      description: 'Identifier for Profile',
      primaryKey: true,
      autoIncrement: true
    },
    firstName: {
      type: Sequelize.STRING,
      description: 'FirstName of User'
    },
    lastName: {
      type: Sequelize.STRING,
      description: 'LastName of User'
    },
    userId:{
      type: Sequelize.INTEGER,
      object: 'User'
    }
  }
}
