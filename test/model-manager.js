'use strict';
const app = require('./app-test.js');
const requiredDirectory = require('require-dir');
const modelFiles = requiredDirectory('./Objects', {recurse: true});
const GsqlModelClass = require('../lib/model.js')

describe('ModelManager:',function(){
  it('should be defined in the gsql instance and should be an instance of model-manager', function(){
    var rawModelManager = require('../lib/model-manager.js');
    expect(app.gi.modelManager).to.be.an.instanceof(rawModelManager);
  });

  it('should be able to access all the defined models in Gsql main.', function(){
    expect(app.gi.modelManager.models).to.deep.equal(app.gi.models);
  })

  // test the mock app
  describe('should have only the intialized models in Objects folder of the Mock App ', function(){
    Object.keys(modelFiles).forEach((modelName)=>{
      it(`${modelName} should exist`, function(){
        let modelTest = app.gi.modelManager.models[modelName];
        expect(modelTest).not.to.be.undefined;
        expect(modelTest).to.an.instanceof(GsqlModelClass);
        expect(Object.keys(app.gi.modelManager)).to.have.lengthOf(5);
      });
    })
  })



  // expectation is depending on the structure of the app in ./Objects
  it("should determine the proper dependency hierarchy",()=>{
    let sequence = ['User','Team','UserProfile','UserRole','Membership'],
      syncSequence = app.gi.modelManager.getSyncSequence();
      expect(syncSequence).to.equal(sequence);
  })

  describe('should correctly establish relationship among models', function(){
    it("",()=>{

    })
    /*
    creates the correct relationship dictionary with its correspond Sequelize relationship
    */
  })
  describe('should create tables if .sync is executed.', function(){
    it("",()=>{

    })

  })

})
