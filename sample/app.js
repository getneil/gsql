'use strict';
let sampleSchema = {
  user: {
    type: 'User'
  },
  users:{
    type: 'User',
    list: true
  },
  profile:{
    type: 'UserProfile'
  },
  team: {
    type: 'Team'
  },
  teams: {
    type: 'Team',
    list: true
  }
};
var gsql = require('./app-test.js').gi;

gsql.modelManager.associateObjects();
gsql.connection.dropAllSchemas()
.then(function(){
  return gsql.modelManager.initializeDatabase()
})
.then(function(){

  return Promise.all([
    gsql.models.User.sequelize.create({id:1,email:'admin-1@gsql.com',password:'test1'}),
    gsql.models.User.sequelize.create({id:2,email:'admin-2@gsql.com',password:'test2'})
  ]).then(function(){
    gsql.models.UserProfile.sequelize.create({id:1, firstName: 'First', lastName:'User', userId:1});
    gsql.models.UserProfile.sequelize.create({id:2, firstName: 'Second', lastName:'User', userId:2});
    gsql.models.UserRole.sequelize.create({id:1, type: 'admin', userId: 1});
    gsql.models.UserRole.sequelize.create({id:2, type: 'regular', userId: 1});
    gsql.models.UserRole.sequelize.create({id:3, type: 'admin', userId: 2});
    gsql.models.UserRole.sequelize.create({id:4, type: 'regular', userId: 2});
    gsql.models.Team.sequelize.create({id:1,name:'Team A'});
    gsql.models.Team.sequelize.create({id:2,name:'Team B'});
  })
})
.then(function(){
  gsql.defineGraphqlSchema(sampleSchema);
  const graphqlHTTP = require('express-graphql');
  const app = require('express')();


  app.use('/graphql', graphqlHTTP({
    schema: gsql.graqphlSchema,
    graphiql: true
  }));

  app.listen(3000);
})
