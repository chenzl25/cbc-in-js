var $extend = require('../util/extend');
var $import = require('../util/import');
var ExprNode = require('./ExprNode');
module.exports = LHSNode;

$extend(LHSNode, ExprNode);
function LHSNode() {
  this.type; // Type 
};

$import(LHSNode.prototype, {
  type: function() {
    return this.type? type : this.origType();
  },

  setType: function(t) {
    this.type = t;
  },

  // Type
  origType: function() {
    throw new Error('LHSNode abstract method call: origType');
  },

  allocSize: function() {
    // this.origType().allocSize();
  },

  isLvalue: function() { 
    return true; 
  },

  isAssignable: function() { 
    return this.isLoadable(); 
  },

  isLoadable: function() {
    var t = origType();
    return !t.isArray() && !t.isFunction();
  }
});

