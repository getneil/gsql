const topoSort = require('toposort-class');
module.exports = {
  camelTo_: (str)=>{
    return str.replace(/\W+/g, '_')
              .replace(/([a-z\d])([A-Z])/g, '$1_$2');
  },
  associationStringName: (assocationElement)=>{
    return assocationElement.sourceName+' '+assocationElement.type+' '+assocationElement.targetName;
  },
  /*
    determines the sequence of how the models(tables) are to be created in the database
  */
  getSyncSequence : function(models){

    let newSort = new topoSort();

    Object.keys(models).forEach((objectName)=>{
      newSort.add(objectName, models[objectName].requires)
    })
    return newSort.sort().reverse();

  }
}
