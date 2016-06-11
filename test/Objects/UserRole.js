'use strict';
var Sequelize = require('sequelize');

module.exports = {
  description: 'Role available to a user',
  attributes: {
    id:{
      type: Sequelize.INTEGER,
      description: 'Identifier for ObjectAs',
      primaryKey: true,
      autoIncrement: true
    },
    type: {
      type: Sequelize.ENUM('admin', 'regular'),
      description: 'An alias for ObjectA',
    },
    userId: {
      type: 'integer',
      object: 'User'
    }
  }
}
