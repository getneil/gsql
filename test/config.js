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

  it('should not include incorrectly defined Objects in the Gsql.models', function(){

    app.gi.define('BadObject',{
      attributes: {
        id: {
          type: Sequelize.INTEGERR, // intentional wrong type
          primaryKey: true,
          autoIncrement: true
        }
      }
    });
    expect(app.gi.models.BadObject).to.be.an('undefined');
  });

  it('should throw error if incorrect attribute type is provided to a model and show what attribute is wrong in what object', function(){

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
    expect(badType).to.throw('Object(Test) attribute(id) has an incorrect type: integerr');
  });

  describe('should apply properly apply Seqeuelize Types to model: ', function(){
    /*
    limited type testing for now, this are just the types I find necessary
    */
    const types = {
      integer: {
        type: Sequelize.INTEGER,
        primaryKey: true // required
      },
      string: {
        type: Sequelize.STRING
      },
      float: {
        type: Sequelize.FLOAT
      },
      boolean: {
        type: Sequelize.BOOLEAN
      },
      date: {
        type: Sequelize.DATE
      },
      time: {
        type: Sequelize.TIME
      }
    }
    let testObject = app.gi.define('TestSequelizeTypes',{
      attributes: types
    });
    Object.keys(types).forEach((type)=>{
      it(`should assign proper Sequelize Type of ${type} to attributes.`, function(){
        expect(testObject.attributes[type].type).to.be.an.instanceof(Sequelize[type.toUpperCase()]);
      });
    });

  });

  describe('should return a proper GSQL Model', function(){
    it('should be an instance of GSQL model', function(){
      expect(app.models.User).to.be.an.instanceof(GsqlModelClass);
    })
    it('with a Sequelize model on  gsql.Define(...).sequelize attribute',function(){
      var sequelizeModelClass = require('../node_modules/sequelize/lib/model/attribute.js');
      expect(app.models.User.sequelize).to.be.an.instanceof(sequelizeModelClass);
    })
    it('with a GraphQL model on  gsql.Define(...).graphql attribute',function(){
      var graphqlModelClass = "";
      expect(app.models.User.graphql).to.be.an.instanceof(graphqlModelClass);
    })
  })

})
