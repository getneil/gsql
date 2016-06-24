'use strict';
var expect = require('chai').expect;

var app = require('../sample/app-test.js')
  , Gsql = require('../')
  , GsqlModelManager = require('../lib/model-manager.js')
  , GsqlModel = require('../lib/model.js')
  , Sequelize = require('sequelize')
  , tools = require('../lib/tools.js')
  , GraphQL = require('graphql')
  , gsqlConvert = require('../lib/configurations/convert.js');


describe('GSQL Model and Gsql.define() :',function(){

  describe('Model Definition', function(){
    let sampleApp = new Gsql('modelDatabase', 'username', 'password', {
      dialect: 'sqlite',
      storage: 'memory'
    });
    function defineInitObject(){
      sampleApp.define('User',{
        attributes: {
          id: {
            type: Sequelize.INTEGER,
            primaryKey: true,
            autoIncrement: true
          }
        }
      })
    }
    defineInitObject();

    it('empty gsql.define() should throw an error if arguments are not defined or are invalid', function(){
      let testDefineError = {
        empty: function(){
          sampleApp.define();
        },
        nameOnly: function(){
          sampleApp.define('TestObject');
        },
        completeButNoAttributes: function(){
          sampleApp.define('TestObject',{});
        }
      }
      expect(testDefineError.empty).to.throw('modelName is not defined.');
      expect(testDefineError.nameOnly).to.throw('Model configuration is not defined.');
      expect(testDefineError.completeButNoAttributes).to.throw('No Model attributes found in the configuration.');
    });

    it('should throw error if incorrect attribute type is provided to a model and show what attribute is wrong in what object but also do not declare it in GSQL.models dictionary', function(){
      let badType = function(){
        sampleApp.define('Test',{
          attributes: {
            id: {
              type: Sequelize.INTEGERR, // intentional wrong type
              primaryKey: true,
              autoIncrement: true
            }
          }
        })
      };
      expect(badType).to.throw('Object(Test) attribute(id) has an undefined type');
      expect(sampleApp.models.BadObject).to.be.an('undefined'); //'should not include incorrectly defined Objects in the Gsql.models'
    });

    it('should detect if duplicate model exists and has been defined twice.', function(){
      expect(defineInitObject).to.throw('Object(User) has been defined twice.');
      expect(sampleApp.models.User).not.to.be.undefined;

    });

    it('Direct Test: dependency checker to identify correct dependencies depending on attributes defined', function(){
      let mockObjects = {
        User:{
          attributes:{
            id:{
              type: Sequelize.INTEGER,
              primaryKey: true
            },
            profileId:{
              type: Sequelize.INTEGER,
              belongsTo: 'UserProfile'
            },
            teams:{
              hasMany: 'Team',
              through: 'Membership' // a n:n relationship using another Membershi object
            },
            roles:{
              hasMany: 'UserRole',
              foreignKey: 'userId'
            }
          },
          dependencies: ['UserProfile']
        },
        Membership:{
          attributes:{
            id:{
              type: Sequelize.INTEGER,
              primaryKey: true
            },
            teamId:{
              type: Sequelize.INTEGER,
              belongsTo: 'Team'
            },
            userId:{
              type: Sequelize.INTEGER,
              belongsTo: 'User'
            }
          },
          dependencies:['User','Team']
        },
        Team: {
          attributes:{
            id: {
              type: Sequelize.INTEGER
            },
            members: {
              hasMany: 'User',
              through: 'Membership'
            }
          },
          dependencies: []
        }
      }

      Object.keys(mockObjects).forEach((objectName)=>{
        let dependencyResult = GsqlModel.getDependency(mockObjects[objectName].attributes);
        expect(dependencyResult).to.have.lengthOf(mockObjects[objectName].dependencies.length);
        expect(dependencyResult).to.have.members(mockObjects[objectName].dependencies);
      });

    })

  })

  describe('Direct Test: Model.assocation() should be able to create a list of assocations', function(){
    let mockAttributes = {
      id:{
        type: Sequelize.INTEGER,
        primaryKey: true
      },
      profileId:{
        type: Sequelize.INTEGER,
        belongsTo: 'UserProfile'
      },
      teams:{
        belongsToMany: 'Team',
        through: 'Membership' // a n:n relationship using another Membershi object
      },
      roles:{
        hasMany: 'UserRole',
        foreignKey: 'userId'
      }
    }

    let expectedResults = [
      {
        sourceName: 'User',
        type: 'belongsTo',
        targetName: 'UserProfile',
        config:{
          foreignKey: 'profileId'
        }
      },
      {
        sourceName: 'User',
        type: 'belongsToMany',
        targetName: 'Team',
        config:{
          throughName: 'Membership'
        }
      },
      {
        sourceName: 'User',
        type: 'hasMany',
        targetName: 'UserRole',
        config:{
          foreignKey: 'userId'
        }
      },
    ]

    let strSort = (a,b)=>{
      let aStr = tools.associationStringName(a),
        bStr = tools.associationStringName(b);
      return aStr.localeCompare(bStr);
    }
    expectedResults.sort(strSort);

    let actualResults = GsqlModel.defineRelationships('User',mockAttributes);
    actualResults.sort(strSort);

    it('mock attributes should generate 3 relationships', function(){
      expect(actualResults).to.have.lengthOf(3);
    })
    expectedResults.forEach((expectedResult,i)=>{
      it(`${expectedResult.sourceName} ${expectedResult.type} ${expectedResult.targetName} should exist.`,function(){
        expect(actualResults[i]).to.deep.equal(expectedResult);
      })
    });

  })

  describe('Indirect Test: should define the proper dependency of object:',function(){
    let dependencyTree = {
      User: [],
      Team: [],
      Membership: ['User','Team'],
      UserProfile: ['User'],
      UserRole: ['User']
    }

    Object.keys(dependencyTree).forEach((objectName)=>{
      it(`${objectName} requires ${dependencyTree[objectName].length ? dependencyTree[objectName]: 'no dependency'}`, function(){
        let appDefinedDependency = app.gi.models[objectName].requires;
        expect(appDefinedDependency).to.have.lengthOf(dependencyTree[objectName].length);
        expect(appDefinedDependency).to.have.members(dependencyTree[objectName]);
      })
    })

  })

  describe('should return a proper GSQL Model', function(){

    it('should be an instance of GSQL model', function(){
      expect(app.gi.models.User).to.be.an.instanceof(GsqlModel);
    })
    it('with a Sequelize model on  gsql.Define(...).sequelize attribute',function(){
      expect(app.gi.models.User.sequelize).to.be.an.instanceof(Sequelize.Model);
    })
    it('with a dictionary of association', function(){
      expect(typeof app.gi.models.User.association).to.be.equal('object');
    })
    // removed being done for now in ModelManager test
    // it('with a GraphQL model on  gsql.Define(...).graphql attribute',function(){
    //   var graphqlModelClass = "";
    //   expect(app.gi.models.User.graphql).to.be.an.instanceof(graphqlModelClass);
    // })
  })

  describe('Return a correct basic graphql field depending on sequelize type provided:',function(){

    var sampleRawAttributes = {
      id:{
        type: Sequelize.INTEGER,
        primaryKey: true
      }
    };

    var sequelizeTypes = Object.keys(gsqlConvert.sequelizeToGraphql);
    sequelizeTypes.forEach((sequelizeType)=>{
      sampleRawAttributes[sequelizeType] = {
        type: Sequelize[sequelizeType.toUpperCase()]
      }
    })

    var graphqlFields = GsqlModel.defineGraphqlFields('Sample',sampleRawAttributes, app.gi.models, app.gi.modelManager.associationDictionary);
    var graphqlQLFieldsKeys = Object.keys(graphqlFields);

    it('should return the same number of fields',function(){
      expect(graphqlQLFieldsKeys).to.have.lengthOf(Object.keys(sampleRawAttributes).length);
    })

    it('should return a GraphQLNonNull for being a PK)', function(){
      expect(graphqlFields.id.type).to.be.an.instanceof(GraphQL.GraphQLNonNull);
    })

    Object.keys(gsqlConvert.sequelizeToGraphql).forEach((field)=>{
      let resultTypeName = graphqlFields[field].type.name
        , expectedTypeName = gsqlConvert.sequelizeToGraphql[field].split('GraphQL')[1];
      it(`expects ${field} GraphQLType ${expectedTypeName}`,function(){
        expect(resultTypeName).to.equal(expectedTypeName);
      })
    })
  })


})
