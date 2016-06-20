'use strict';
var Sequelize = require('sequelize');
const crypto = require('crypto');
const secret = 'abcdefg';

const encryptPassword = (user, options) => {
  let hash = crypto.createHmac('sha256', secret)
                     .update(user.password)
                     .digest('hex');
  user.password = hash;
}
module.exports = {
  description: 'Details of the user account used for login credentials.',
  attributes: {
    id:{
      type: Sequelize.INTEGER,
      description: 'Identifier for User',
      primaryKey: true,
      autoIncrement: true
    },
    email: {
      type: Sequelize.STRING,
      description: 'Email of user can be used for logging in.',
      unique: true,
      validate: {
        isEmail: true
      }
    },
    password: {
      type: Sequelize.STRING,
      description: 'Password for this account should be hashed by Bcrypt.',
      validate: {
        notEmpty: true
      }
    },
    birthdate:{
      type: Sequelize.DATE,
      allowNull: false,
      defaultValue: Sequelize.NOW
    },
    teams:{
      belongsToMany: 'Team',
      through: 'Membership' // a n:n relationship using another Membershi object
    },
    profile:{
      hasOne: 'UserProfile',
      foreignKey: 'userId'
    },
    roles:{
      hasMany: 'UserRole',
      foreignKey: 'userId' // a direct 1:n relationship connection via FK as userId
    }
  },
  config:{
    tableName: 'users',
    freezeTableName: true,
    hooks:{
      beforeUpdate: encryptPassword,
      beforeCreate: encryptPassword
    }
  }
}
