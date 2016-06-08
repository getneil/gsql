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

  describe('should return a proper GSQL Model', function(){
    it('should be an instance of GSQL model', function(){
      expect(app.models.User).to.be.an.instanceof(GsqlModelClass);
    })
    it('with a Sequelize model on  gsql.Define(...).sequelize attribute',function(){
      var sequelizeModelClass = require('../node_modules/sequelize/lib/model/attributes.js');
      expect(app.models.User.sequelize).to.be.an.instanceof(sequelizeModelClass);
    })
    it('with a GraphQL model on  gsql.Define(...).graphql attribute',function(){
      var graphqlModelClass = "";
      expect(app.models.User.graphql).to.be.an.instanceof(graphqlModelClass);
    })
  })

})
