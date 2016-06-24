'use strict';
var expect = require('chai').expect;

var Gsql = require('../')
  , GsqlModelClass = require('../lib/model.js')
  , Sequelize = require('sequelize');

describe('GSQL config:', function(){
  var configGsql = new Gsql('database-config', 'username', 'password', {
    dialect: 'sqlite',
    storage: 'memory'
  });

  it('should be an instance of Gsql', function(){
    expect(configGsql).to.be.an.instanceof(Gsql);
  })

  it('should have a define method', function(){
    expect(configGsql.define).to.be.a('function');
  })

  it('should return the Sequelize connection object', function(){
    expect(configGsql.connection).to.be.an.instanceof(Sequelize);
  })

  it('should pass a connection test: seqeuelize.authenticate()', function(done){

    var connected = false
      , test =  function(){
        expect(connected).to.equal(true);
        done();
      };

    configGsql.connection.authenticate()
    .then(()=>{
      connected = true;
      test();
    })
    .catch(test);

  })

  it('should have a defineGraphqlSchema method', function(){
    expect(configGsql.defineGraphqlSchema).to.be.a('function');
  })
});
