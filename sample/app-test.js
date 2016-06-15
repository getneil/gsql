'use strict';
var Gsql = require('../'),
  gsql = new Gsql('database', 'username', 'password', {
    dialect: 'sqlite',
    storage: 'memory'
  });
var Sequelize = require('sequelize');
function camelTo_(str) {
  return str.replace(/\W+/g, '_')
            .replace(/([a-z\d])([A-Z])/g, '$1_$2');
}

const requiredDirectory = require('require-dir');
const modelFiles = requiredDirectory('../sample/Objects', {recurse: true});
const models = {};
for (var key of Object.keys(modelFiles)) {
  models[key] = gsql.define(key, modelFiles[key]);
}


module.exports = {
  gi: gsql, // GsqlInstance
  models: models,
  modelManager: gsql.modelManager
}
