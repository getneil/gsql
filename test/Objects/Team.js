'use strict';
var Sequelize = require('sequelize');

module.exports = {
  description: 'Details of the user account',
  attributes: {
    id:{
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    name: {
      type: Sequelize.STRING
    },
    members: {
      list: 'User',
      through: 'Membership'
    }
  }
}
