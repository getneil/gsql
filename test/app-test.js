var Gsql = require('../'),
  gsql = new Gsql('database', 'username', 'password', {
    dialect: 'sqlite',
    storage: 'memory'
  });
const userConfig = require('./Objects/User.js');
const userProfileConfig = require('./Objects/UserProfile.js');
const userRoleConfig = require('./Objects/UserRole.js');

const User = gsql.define('User', userConfig);
const UserProfile = gsql.define('UserRole', userProfileConfig);
const UserRole = gsql.define('UserRole', userRoleConfig);

module.exports = {
  gi: gsql, // GsqlInstance
  models:{
    User: User,
    UserProfile: UserProfile,
    UserRole: UserRole
  }
}
