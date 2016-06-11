'use strict';
var Sequelize = require('sequelize');
module.exports = {
  description: 'Establishes the relationship of User and Team',
  attributes: {
    id:{
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    userId: {
      type: Sequelize.INTEGER,
      object: 'User'
    },
    teamId: {
      type: Sequelize.INTEGER,
      object: 'Team'
    }
  }
}
