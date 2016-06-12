'use strict';
var expect = require('chai').expect;

var app = require('./app-test.js')
  , GsqlRaw = require('../lib/gsql.js')
  , GsqlModelClass = require('../lib/model.js')
  , Sequelize = require('sequelize');


describe('GSQL Model and Gsql.define() :',function(){

  it('empty gsql.define() should throw an error if arguments are not defined or are invalid', function(){
    let testDefineError = {
      empty: function(){
        app.gi.define();
      },
      nameOnly: function(){
        app.gi.define('TestObject');
      },
      completeButNoAttributes: function(){
        app.gi.define('TestObject',{});
      }
    }
    expect(testDefineError.empty).to.throw('modelName is not defined.');
    expect(testDefineError.nameOnly).to.throw('Model configuration is not defined.');
    expect(testDefineError.completeButNoAttributes).to.throw('No Model attributes found in the configuration.');
  });


  it('should throw error if incorrect attribute type is provided to a model and show what attribute is wrong in what object but also do not declare it in GSQL.models dictionary', function(){
    let badType = function(){
      app.gi.define('Test',{
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
    expect(app.gi.models.BadObject).to.be.an('undefined'); //'should not include incorrectly defined Objects in the Gsql.models'
  });

  it('should detect if duplicate model exists and has been defined twice.', function(){

    let duplicate = function(){
      app.gi.define('User',{
        attributes: {
          id: {
            type: Sequelize.INTEGER,
            primaryKey: true,
            autoIncrement: true
          }
        }
      })
    };

    expect(duplicate).to.throw('Object(User) has been defined twice.');
    expect(app.gi.models.User).not.to.be.undefined;

  });

  it('dependency checker to identify correct dependencies depending on attributes defined', function(){
    let mockObjects = {
      User:{
        attributes:{
          id:{
            type: Sequelize.INTEGER,
            primaryKey: true
          },
          profileId:{
            type: Sequelize.INTEGER,
            object: 'UserProfile'
          },
          teams:{
            list: 'Team',
            through: 'Membership' // a n:n relationship using another Membershi object
          },
          roles:{
            list: 'UserRole',
            via: 'userId'
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
            object: 'Team'
          },
          userId:{
            type: Sequelize.INTEGER,
            object: 'Team'
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
            list: 'User',
            through: 'Membership'
          }
        },
        dependencies: []
      }
    }

    Object.keys(mockObjects).forEach((objectName)=>{
      let dependencyResult = GsqlModelClass.getDependency(mockObjects[objectName].attributes);
      expect(dependencyResult).to.have.lengthOf(mockObjects[objectName].dependencies.length);
      expect(dependencyResult).to.have.members(mockObjects[objectName].dependencies);
    });

  })

  describe('should define the proper dependency of object:',function(){
    let dependencyTree = {
      User: ['UserProfile'],
      Team: [],
      Membership: ['User','Team'],
      UserProfile: [],
      UserRole: ['User']
    }

    Object.keys(dependencyTree).forEach((objectName)=>{
      it(`${objectName} to have ${dependencyTree[objectName].join(', ')}`, function(){

        let appDefinedDependency = app.gi.models[objectName].dependency;

        expect(appDefinedDependency).to.have.lengthOf(dependencyTree[objectName].length);
        expect(appDefinedDependency).to.have.members(dependencyTree[objectName]);
      })
    })

  })

  describe('should return a proper GSQL Model', function(){

    it('should be an instance of GSQL model', function(){
      expect(app.gi.models.User).to.be.an.instanceof(GsqlModelClass);
    })
    it('with a Sequelize model on  gsql.Define(...).sequelize attribute',function(){
      expect(app.gi.models.User.sequelize).to.be.an.instanceof(Sequelize.Model);
    })
    it('with a GraphQL model on  gsql.Define(...).graphql attribute',function(){
      var graphqlModelClass = "";
      expect(app.gi.models.User.graphql).to.be.an.instanceof(graphqlModelClass);
    })
  })

})
