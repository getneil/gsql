'use strict';
var expect = require('chai').expect;

var app = require('../sample/app-test.js')
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
  // it('should have a linkObjects method', function(){
  //   // this will initialize the association/relationship of the Sequelize models
  //   // will also be used by graphQL to establish type relation among objects
  //   // note: create a modelManager object
  //   expect(app.gi.linkObjects).to.be.a('function');
  // })
  it('should have a defineGraphqlSchema method', function(){
    expect(app.gi.defineGraphqlSchema).to.be.a('function');
  })
});
