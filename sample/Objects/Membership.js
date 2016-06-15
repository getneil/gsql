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
      belongsTo: 'User'
    },
    teamId: {
      type: Sequelize.INTEGER,
      belongsTo: 'Team'
    }
  }
}
