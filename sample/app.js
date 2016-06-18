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

  return gsql.models.User.sequelize.bulkCreate([
    {id:1,email:'admin-1@gsql.com',password:'test1'},
    {id:2,email:'admin-2@gsql.com',password:'test2'}
  ]).then(function(){
    gsql.models.UserProfile.sequelize.bulkCreate([
      {id:1, firstName: 'First', lastName:'User', userId:1},
      {id:2, firstName: 'Second', lastName:'User', userId:2}
    ]);

    gsql.models.UserRole.sequelize.bulkCreate([
      {id:1, type: 'admin', userId: 1},
      {id:2, type: 'regular', userId: 1},
      {id:3, type: 'admin', userId: 2},
      {id:4, type: 'regular', userId: 2}
    ]);

    Promise.all([
      gsql.models.Team.sequelize.create({id:1,name:'Team A'}),
      gsql.models.Team.sequelize.create({id:2,name:'Team B'})
    ]).then(()=>{
      gsql.models.Membership.sequelize.bulkCreate([
        {id:1,userId:1,teamId:1},
        {id:2,userId:1,teamId:2},
        {id:3,userId:2,teamId:1},
        {id:4,userId:2,teamId:2},
      ])
    })
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
