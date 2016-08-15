var $extend = require('../util/extend');
var $import = require('../util/import');
var Node = require('./Node');
module.exports = ExprNode;

$extend(ExprNode, Node);
function ExprNode() {

};

$import(ExprNode.prototype, {
  type: function() {
    throw new Error('ExprNode abstract method call: type');
  },

  origType: function() {
    // return this.type();
  },

  allocSize: function() { 
    // return this.type().allocSize(); 
  },

  isConstant: function() { 
    return false; 
  },
  
  isParameter: function() { 
    return false; 
  },

  
  isLvalue: function() { 
    return false; 
  },
  
  isAssignable: function() { 
    return false; 
  },
  
  isLoadable: function() { 
    return false; 
  },

  isCallable: function() {
    // return this.type().isCallable();
  },

  isPointer: function() {
    // return type().isPointer();
  },

  // accept: function(visitor){}
});
