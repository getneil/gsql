var expect = require('chai').expect;

var app = require('./app-test.js')
  , GsqlRaw = require('../lib/gsql.js')
  , Sequelize = require('sequelize');

describe('GSQL config:', function(){

  it('should be an instance of Gsql', function(){
    expect(app.gsqlInstance).to.be.an.instanceof(GsqlRaw);
  })

  it('should have a define method', function(){
    expect(app.gsqlInstance.define).to.be.a('function');
  })

  it('should return the Sequelize connection object', function(){
    expect(app.gsqlInstance.connection).to.be.an.instanceof(Sequelize);
  })

});
