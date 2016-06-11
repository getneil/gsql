'use strict';
var expect = require('chai').expect;

var app = require('./app-test.js')
  , GsqlRaw = require('../lib/gsql.js')
  , GsqlModelClass = require('../lib/model.js')
  , Sequelize = require('sequelize');

describe('GSQL config:', function(){

  it('should be an instance of Gsql', function(){
    expect(app.gi).to.be.an.instanceof(GsqlRaw);
  })

  it('should have a define method', function(){
    expect(app.gi.define).to.be.a('function');
  })

  it('should return the Sequelize connection object', function(){
    expect(app.gi.connection).to.be.an.instanceof(Sequelize);
  })
  it('should pass a connection test: seqeuelize.authenticate()', function(done){

    var connected = false,
      test =  function(){
        expect(connected).to.equal(true);
        done();
      }

    app.gi.connection.authenticate()
    .then(()=>{
      connected = true;
      test();
    })
    .catch(test);

  })
  it('should have a linkObjects method', function(){
    // this will initialize the association/relationship of the Sequelize models
    // will also be used by graphQL to establish type relation among objects
    // note: create a modelManager object
    expect(app.gi.linkObjects).to.be.a('function');
  })
  it('should have a defineGraphqlSchema method', function(){
    expect(app.gi.defineGraphqlSchema).to.be.a('function');
  })
});

describe('GSQL Define() :',function(){

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
    let objName = 'ObjectAAA';
    app.gi.define(objName,{
      attributes: {
        id: {
          type: Sequelize.INTEGER,
          primaryKey: true,
          autoIncrement: true
        }
      }
    })
    let duplicate = function(){
      app.gi.define(objName,{
        attributes: {
          id: {
            type: Sequelize.INTEGER,
            primaryKey: true,
            autoIncrement: true
          }
        }
      })
    };
    expect(app.gi.models).not.to.be.undefined;
    expect(duplicate).to.throw(`Object(${objName}) has been defined twice.`);
  });
  describe('should return a proper GSQL Model', function(){

    app.gi.define('NewUser',{
      attributes:{
        id: {
          type: Sequelize.INTEGER,
          primaryKey: true
        }
      }
    })

    it('should be an instance of GSQL model', function(){
      expect(app.gi.models.NewUser).to.be.an.instanceof(GsqlModelClass);
    })
    it('with a Sequelize model on  gsql.Define(...).sequelize attribute',function(){
      expect(app.gi.models.NewUser.sequelize).to.be.an.instanceof(Sequelize.Model);
    })
    it('with a GraphQL model on  gsql.Define(...).graphql attribute',function(){
      var graphqlModelClass = "";
      expect(app.gi.models.User.graphql).to.be.an.instanceof(graphqlModelClass);
    })
  })

})
