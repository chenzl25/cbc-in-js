var $extend = require('../util/extend');
var $import = require('../util/import');
var ExprNode = require('./ExprNode');
module.exports = LHSNode;

$extend(LHSNode, ExprNode);
function LHSNode() {
  this._type; // Type 
};

$import(LHSNode.prototype, {
  type: function() {
    return this._type? this._type : this.origType();
  },

  setType: function(t) {
    this._type = t;
  },

  // Type
  origType: function() {
    throw new Error('LHSNode abstract method call: origType');
  },

  allocSize: function() {
    return this.origType().allocSize();
  },

  isLvalue: function() { 
    return true; 
  },

  isAssignable: function() { 
    return this.isLoadable(); 
  },

  isLoadable: function() {
    var t = this.origType();
    return !t.isArray() && !t.isFunction();
  }
});

