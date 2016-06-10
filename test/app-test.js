var Gsql = require('../'),
  gsql = new Gsql('database', 'username', 'password', {
    dialect: 'sqlite',
    storage: 'memory'
  });

const config = {
  User:  require('./Objects/User.js'),
  UserProfile: require('./Objects/UserProfile.js'),
  UserRole: require('./Objects/UserRole.js'),
  Team: require('./Objects/Team.js'),
  Membership: require('./Objects/Membership.js')
}

const models = {};
Object.keys(config).forEach((k)=>{
  models[k] = gsql.define(k, config[k]);
})
module.exports = {
  gi: gsql, // GsqlInstance
  models: models
}
