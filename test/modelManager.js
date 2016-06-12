'use strict';
const app = require('./app-test.js');
const expect = require('chai').expect;
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
  describe('should only have the intialized models in Objects folder of the Mock App ', function(){
    it('should have the proper length of objects',function(){
      expect(Object.keys(app.gi.modelManager.models)).to.have.lengthOf(Object.keys(modelFiles).length);
    });
    Object.keys(modelFiles).forEach((modelName)=>{
      it(`${modelName} should exist`, function(){
        let modelTest = app.gi.modelManager.models[modelName];
        expect(modelTest).not.to.be.undefined;
        expect(modelTest).to.be.an.instanceof(GsqlModelClass);
      });
    })
  })



  // expectation is depending on the structure of the app in ./Objects
  it("should determine the proper dependency hierarchy",()=>{
    let sequence = ['UserProfile','User','Team','Membership','UserRole'],
      syncSequence = app.gi.modelManager.getSyncSequence(),
      inOrder = true;

      sequence.forEach((expectedObject,index)=>{
        if(!syncSequence[index] || syncSequence[index] != expectedObject){
          inOrder = false;
        }
      })
      expect(inOrder).to.equal(true);
  })
  it('should have an initializeDatabase function & initialize correctly', function(done){
    expect(app.gi.modelManager.initializeDatabase).to.be.a('function');
    let noError = true;
    app.gi.modelManager.initializeDatabase()
    .then(function(){
      expect(noError).to.equal(true);
      done()
    })
    .catch((err)=>{
      noError = false;
      expect(noError).to.equal(true);
      done(err)
    })

  });

  describe('should initialize database properly by veryfying created tables', function(){


    it('should have all the expected tables',function(){

    })
  })
  describe('should correctly establish relationship among models', function(){
    it("",()=>{

    })
    /*
    creates the correct relationship dictionary with its correspond Sequelize relationship
    */
  })


})
