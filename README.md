# GSQL
Simplified Sequelize and GraphQL models

### Table of Contents
**[Features](#features)**
**[Installation Instructions](#usage)**
**[Usage Instructions](#usage-instructions)**
**[Limitations or Next Steps](#limitations)**
**[Dependencies](#dependencies)**
##Features

## Installation Instruction
```
npm install gsql
```
to save in package.json as a dependency
```
npm install --save gsql
```

## Usage Instructions
[Example App](https://github.com/getneil/gsql/tree/develop/sample)
```
var gsql = require('gsql'),
  sequelize = require('sequelize');

// simple sequelize initialization
var sampleApp = new gsql('DATABASE_NAME', 'username', 'password', {
  host: '127.0.0.1',
  dialect: 'postgres',
  pool: {
    max: 5,
    min: 0,
    idle: 10000
  }
});

// has 1:1 relationship with UserProfile
sampleApp.define('User',{
    description: 'A person using the app.',
    attributes:{
      id: {
        type: sequelize.INTEGER,
        primaryKey: true,
        description: 'unique identifier of the user.'
      },
      email: {
        type: sequelize.STRING,
        unique: true,
        description: 'a way for the user to receive notification if not logged in.'
      },
      profile: {
        hasOne: 'UserProfile', // refers to the name of user
        foreignKey: 'userId'
      }
    },
    config:{
      tableName: 'users',
      freezeTableName: true,
      hooks:{
        beforeCreate: function(user, options){
          user.email = user.email.replace('@','-');
          // transform the data
        }
      }
    }
});
sampleApp.define('UserProfile',{
    description: 'The first name and last name of the user.',
    attributes:{
      id: {
        type: sequelize.INTEGER,
        primaryKey: true,
        description: 'unique identifier of the user.'
      },
      firstName: {
        type: sequelize.STRING,
        description: 'First Name description.'
      },
      lastName: {
        type: sequelize.STRING,
        description: 'Last Name description.'
      },
      userId: {
        type: sequelize.INTEGER,
        belongsTo: 'User'
      }
    }
});

// This will link objects using relationships belongsTo, hasOne, hasMany and belongsToMany
// there is an example app provided just check it out  https://github.com/getneil/gsql/tree/develop/sample
sampleApp.modelManager.associateObjects();

// will alter the database using Sequelize sync({force:true})
// returns a promise
sampleApp.modelManager.initializeDatabase()
.then(function(){
  // maybe you want to make some seed data?

  var User = sampleApp.models.User.sequelize
    , UserProfile = sampleApp.models.UserProfile.sequelize;

  sampleApp.models.User.sequelize.create({
    email: 'user@gmail.com',
    profile: {
      firstName: 'Karl',
      lastName: 'Marx'
    }
  },{
    include: [UserProfile]
  }).then(function(){
    console.log("data created!")
  });

})


var graphqlSchema = sampleApp.defineGraphqlSchema({
  user: {
    type: 'User'
  },
  users:{
    type: 'User',
    list: true
  }
});

const graphqlHTTP = require('express-graphql');
const app = require('express')();

app.use('/graphql', graphqlHTTP({
  schema: graphqlSchema,
  graphiql: true
}));

app.listen(3000);


```

## Next Steps
- be able to use custom GraphQL resolvers
- be able to add dependency to the same model
- etc maybe you have a request?

## Dependencies
- [Sequelize](http://docs.sequelizejs.com/en/latest/)
- [GraphQL](https://github.com/facebook/graphql)
- [graphql-sequelize](https://github.com/mickhansen/graphql-sequelize)
