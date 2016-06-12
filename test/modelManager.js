'use strict';
const app = require('./app-test.js');
const expect = require('chai').expect;
const requiredDirectory = require('require-dir');
const modelFiles = requiredDirectory('./Objects', {recurse: true});
const GsqlModelClass = require('../lib/model.js');
const tools = require('../lib/tools.js');

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


  let sequence = [ 'User', 'Team', 'Membership', 'UserProfile', 'UserRole' ];
  // expectation is depending on the structure of the app in ./Objects
  it("should determine the proper dependency hierarchy",()=>{
    let syncSequence = app.gi.modelManager.getSyncSequence(),
      inOrder = true;
      sequence.forEach((expectedObject,index)=>{
        if(!syncSequence[index] || syncSequence[index] != expectedObject){
          inOrder = false;
        }
      })
      expect(inOrder).to.equal(true);
  })


  describe('should register all model relationships of the MockApp', function(){
    let allAssocs = [];
    app.gi.modelManager.associateObjects();


    it('count if all objects to be under ModelManager.associationDictionary', function(){
      Object.keys(app.gi.models).forEach((objectName)=>{
        allAssocs = allAssocs.concat(app.gi.models[objectName].association);
      });
      expect(Object.keys(app.gi.modelManager.associationDictionary)).to.have.lengthOf(allAssocs.length);
    })

    describe('should have all expected relationships', function(){
      let expectedRelationships = [
        'User hasMany UserRole',
        'User belongsToMany Team',
        'UserProfile belongsTo User',
        'Team belongsToMany User',
        'UserRole belongsTo User',
        'Membership belongsTo User',
        'Membership belongsTo Team'
      ];
      console.log(app.gi.modelManager.associationDictionary);
      expectedRelationships.forEach((rel)=>{
        it(`${rel} should exist`,function(){
          expect(app.gi.modelManager.associationDictionary[rel]).not.to.be.undefined;
        })
      })
    });
    /*
    creates the correct relationship dictionary with its correspond Sequelize relationship
    */
  })

  it('should have an initializeDatabase function & initialize it correctly', function(done){
    expect(app.gi.modelManager.initializeDatabase).to.be.a('function');
    let noError = true;
    app.gi.modelManager.initializeDatabase()
    .then(function(data){
      let notFound = false;
      sequence.forEach((k)=>{
        let seqName = tools.camelTo_(k).toLowerCase();
        let found = data.find((obj)=>{
          return obj.name === seqName;
        })
        if(!found){
          notFound = true;
        }
      });
      expect(notFound).to.equal(false);
      expect(noError).to.equal(true);
      done()
    })
    .catch((err)=>{
      noError = false;
      expect(noError).to.equal(true);
      done(err)
    })

  });



})
