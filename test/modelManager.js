'use strict';
const chai = require('chai')
  , sinon = require("sinon")
  , sinonChai = require("sinon-chai")
  , expect = chai.expect
  , spy = chai.spy;

chai.use(sinonChai);

const requiredDirectory = require('require-dir');

const mockObjects = requiredDirectory('./Objects', {recurse: true});

const Gsql = require('../lib/gsql.js')
  , GsqlModelClass = require('../lib/model.js')
  , GsqlModelManagerClass = require('../lib/model-manager.js')
  , tools = require('../lib/tools.js');

const graphql = require('graphql')
  , GraphQLList = graphql.GraphQLList
  , GraphQLObjectType = graphql.GraphQLObjectType
  , GraphQLSchema = graphql.GraphQLSchema;

const graphqlSequelize = require('graphql-sequelize')
  , resolver = graphqlSequelize.resolver
  , defaultListArgs = graphqlSequelize.defaultListArgs
  , defaultArgs = graphqlSequelize.defaultArgs;

describe('ModelManager:',function(){
  let sampleApp = new Gsql('ModelManagerTest1', 'username', 'password', {
    dialect: 'sqlite',
    storage: 'memory'
  });
  const models = {};
  for (var key of Object.keys(mockObjects)) {
    models[key] = sampleApp.define(key, mockObjects[key]);
  }

  it('should be defined in the gsql instance and should be an instance of model-manager', function(){
    expect(sampleApp.modelManager).to.be.an.instanceof(GsqlModelManagerClass);
  });

  it('should be able to access all the defined models in Gsql main.', function(){
    expect(sampleApp.modelManager.models).to.deep.equal(sampleApp.models);
  })

  // test the mock app
  describe('should only have the intialized models in Objects folder of the Mock App ', function(){
    it('should have the proper length of objects',function(){
      expect(Object.keys(sampleApp.modelManager.models)).to.have.lengthOf(Object.keys(mockObjects).length);
    });
    Object.keys(mockObjects).forEach((modelName)=>{
      it(`${modelName} should exist`, function(){
        let modelTest = sampleApp.modelManager.models[modelName];
        expect(modelTest).not.to.be.undefined;
        expect(modelTest).to.be.an.instanceof(GsqlModelClass);
      });
    })
  })


  let sequence = [ 'User', 'Team', 'Membership', 'UserProfile', 'UserRole' ];

  describe('should register all model relationships of the MockApp', function(){
    let allAssocs = [],
      modelNames = Object.keys(sampleApp.models);
    let assembleGraphQLObjectsSpy = sinon.spy(sampleApp.modelManager,'assembleGraphQLObjects'),
      modelSpies = {};

    modelNames.forEach((objectName)=>{
      modelSpies[objectName] = sinon.spy(sampleApp.models[objectName],'createGraphQLInstance');
    });

    sampleApp.modelManager.associateObjects();


    it('count if all objects to be under ModelManager.associationDictionary', function(){
      modelNames.forEach((objectName)=>{
        allAssocs = allAssocs.concat(sampleApp.models[objectName].association);
      });
      expect(Object.keys(sampleApp.modelManager.associationDictionary)).to.have.lengthOf(allAssocs.length);
    })
    describe('should have all expected relationships', function(){
      let expectedRelationships = [
        'User hasMany UserRole',
        'User hasOne UserProfile',
        'User belongsToMany Team',
        'UserProfile belongsTo User',
        'Team belongsToMany User',
        'UserRole belongsTo User',
        'Membership belongsTo User',
        'Membership belongsTo Team'
      ];
      expectedRelationships.forEach((rel)=>{
        it(`${rel} should exist`,function(){
          var relVal = sampleApp.modelManager.associationDictionary[rel];
          //console.log(relVal.source,relVal.associationType,relVal.target); improve test by comparing internal values of relVal
          expect(sampleApp.modelManager.associationDictionary[rel]).not.to.be.undefined;
          var m = sampleApp.modelManager.associationDictionary[rel];
        })
      })
    });
    /*
    creates the correct relationship dictionary with its correspond Sequelize relationship
    */
    //app.gi.modelManager.assembleGraphQLObjects(assembleGraphQLObjectsSpy);
    it('after association it should trigger the graphQL object assembly : gsql.modelManager.assembleGraphQLObjects', function(){
      expect(assembleGraphQLObjectsSpy).to.have.been.called;
    })

    describe('properly trigger graphql initalization all models',function(){

      modelNames.forEach((objectName)=>{
        it(`should initialize ${objectName} graphqlization`,function(){
          expect(modelSpies[objectName]).to.have.been.called;
        })
      });
    })
  })

  describe('GraphQL Models starting:', function(){

    describe('graphql models: ', function(){

      Object.keys(mockObjects).forEach((modelName)=>{
        it(`${modelName} should have a graphql object in the Gsql.models as .graphql property`, function(){
          let generatedGraphQLObject = sampleApp.models[modelName].graphql;
          expect(generatedGraphQLObject).not.to.be.undefined;
          expect(generatedGraphQLObject).to.an.instanceof(graphql.GraphQLObjectType);
        })
      })
    })


  })

  it('should have an initializeDatabase function & initialize it correctly', function(done){
    expect(sampleApp.modelManager.initializeDatabase).to.be.a('function');
    let noError = true;
    sampleApp.connection.dropAllSchemas()
    .then(function(){
      sampleApp.modelManager.initializeDatabase()
      .then(function(data){
        let notFound = false;
        sequence.forEach((k)=>{
          let seqName = tools.camelTo_(k).toLowerCase();
          let found = data.find((obj)=>{
            return obj.name === seqName;
          })
          if(!found){
            notFound = true;
          }
        });
        expect(notFound).to.equal(false);
        expect(noError).to.equal(true);
        done()
      })
      .catch((err)=>{
        noError = false;
        expect(noError).to.equal(true);
        done(err)
      })
    })
  });
})

describe('GraphQL Associations', function(){
  let sampleApp = new Gsql('ModelManagerTest2', 'username', 'password', {
    dialect: 'sqlite',
    storage: 'memory'
  });
  const models = {};
  for (var key of Object.keys(mockObjects)) {
    models[key] = sampleApp.define(key, mockObjects[key]);
  }
  sampleApp.modelManager.associateObjects();

  var rawRelationships = {
    // 1:1
    profile: {
      hasOne: 'UserProfile',
      foreignKey: 'userId'
    },
    // 1:n
    roles: {
      hasMany: 'UserRole',
      foreignKey: 'userId'
    },
    // n:n
    teams:{
      belongsToMany: 'Team',
      through: 'Membership'
    }
  }
  var graphQLFieldsWithRelationships = GsqlModelClass.defineGraphqlFields(
    'User',
    rawRelationships,
    sampleApp.models,
    sampleApp.modelManager.associationDictionary
  );

  it('should return same number of fields for attributes with relationships', function(){
    expect(Object.keys(graphQLFieldsWithRelationships)).to.have.lengthOf(Object.keys(rawRelationships).length);
  })
  it('should return a 1:1 relationship if proper config is provided', function(){
    expect(graphQLFieldsWithRelationships.profile).not.to.be.undefined;
    expect(graphQLFieldsWithRelationships.profile.type).to.be.an.instanceof(GraphQLObjectType);
    expect(graphQLFieldsWithRelationships.profile.type.name).to.equal('UserProfile');
  })
  it('should return a 1:n relationship if proper config is provided', function(){
    expect(graphQLFieldsWithRelationships.roles).not.to.be.undefined;
  })
  it('should return a n:n relationship if proper config is provided', function(){
    expect(graphQLFieldsWithRelationships.teams).not.to.be.undefined;
  })
})

describe('Mock GraphQLSchema creation', function(){
  let sampleApp = new Gsql('ModelManagerTest3', 'username', 'password', {
    dialect: 'sqlite',
    storage: 'memory'
  });
  const models = {};
  for (var key of Object.keys(mockObjects)) {
    models[key] = sampleApp.define(key, mockObjects[key]);
  }
  sampleApp.modelManager.associateObjects();

  let rootQueryFieldsConfig = {
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

  describe('correctly define graphql query fields',function(){
    let models = sampleApp.models;
    let resultRootQueryFields = Gsql.getGraphqlQueryFields(models, rootQueryFieldsConfig);
    Object.keys(rootQueryFieldsConfig).forEach((field)=>{

      var isList = rootQueryFieldsConfig[field].list
        , result = resultRootQueryFields[field];

      it(`"${field}" query field should be defined`,function(){
        expect(result).to.not.be.undefined;
      })

      if(isList){
        it(`should return a proper list query field for ${field}`,function(){
          expect(result.args.limit).to.not.be.undefined;
          expect(result.type).to.have.instanceof(GraphQLList);
        })
      }else{
        it(`should return a proper object type query field for ${field}`,function(){
          expect(result.args.where).to.not.be.undefined;
          expect(result.type).to.have.instanceof(GraphQLObjectType);
        })
      }
    })
  })

  describe('GSQL.defineGraphqlSchema',function(){

    var resultSchema = sampleApp.defineGraphqlSchema(rootQueryFieldsConfig);

    it('should return a proper graphql schema', function(){
      expect(resultSchema).to.be.an.instanceof(GraphQLSchema);
    })
  })
})
