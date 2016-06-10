'use strict';
module.exports = {
  description: 'Establishes the relationship of User and Team',
  attributes: {
    id:{
      type: 'integer',
      primaryKey: true,
      autoIncrement: true
    },
    userId: {
      type: 'integer',
      object: 'User'
    },
    teamId: {
      type: 'integer',
      object: 'Team'
    }
  }
}
