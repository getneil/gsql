module.exports = {
  camelTo_: (str)=>{
    return str.replace(/\W+/g, '_')
              .replace(/([a-z\d])([A-Z])/g, '$1_$2');
  },
  associationStringName: (assocationElement)=>{
    return assocationElement.sourceName+' '+assocationElement.type+' '+assocationElement.targetName;
  }
}
