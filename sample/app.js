'use strict';
let sampleSchema = {
  user: {
    type: 'User'
  },
  users:{
    type: 'User',
    list: true
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
gsql.modelManager.initializeDatabase()
.then(function(){
  gsql.models.User.sequelize.create({id:1,email:'admin-1@gsql.com',password:'test1'});
  gsql.models.User.sequelize.create({id:2,email:'admin-2@gsql.com',password:'test2'});
  gsql.models.Team.sequelize.create({id:1,name:'Team A'});
  gsql.models.Team.sequelize.create({id:2,name:'Team B'});
})
gsql.defineGraphqlSchema(sampleSchema);




const graphqlHTTP = require('express-graphql');
const app = require('express')();


app.use('/graphql', graphqlHTTP({
  schema: gsql.graqphlSchema,
  graphiql: true
}));

app.listen(3000);
