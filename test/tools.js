'use strict';
var expect = require('chai').expect
  , Sequelize = require('sequelize');

var GsqlModel = require('../lib/model.js'),
  tools = require('../lib/tools.js');

const sampleAttributes = {
  id:{
    type: Sequelize.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  userId:{
    type: Sequelize.INTEGER,
    object: 'User'
  },
  members: {
    list: 'User',
    through: 'Membership'
  },
  type: {
    type: Sequelize.ENUM('happy', 'meaningful'),
    description: 'type of life'
  }
}
describe('GSQL: Model',function(){

  it('defineSequelizeAttributes(rawAttributes) should include all Sequelize.TYPED attributes',function(){
    let acceptedAttributes = Object.keys(GsqlModel.defineSequelizeAttributes(sampleAttributes)),
      anAttributeWasNotFound = false;
    ['id','userId','type'].forEach((k)=>{
      if(acceptedAttributes.indexOf(k) < 0){
        anAttributeWasNotFound = true;
      }
    });
    expect(anAttributeWasNotFound).to.be.false;
  })
  it('defineSequelizeAttributes(rawAttributes) should not include untyped attributes',function(){
    let memberIndex = Object.keys(GsqlModel.defineSequelizeAttributes(sampleAttributes)).indexOf('members');
    expect(memberIndex).to.equal(-1);
  })
})

describe('tools.associationStringName should be working correctly "sourceName relationshipType targetName" ',function(){

  let exampleObject = {
    target: new Object(),
    source: new Object(),
    targetName: 'Role',
    sourceName: 'User',
    type: 'hasMany'
  }

  expect(tools.associationStringName(exampleObject)).to.equal('User hasMany Role');

})
