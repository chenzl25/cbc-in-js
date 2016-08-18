var $extend = require('../util/extend');
var $import = require('../util/import');
var Variable = require('./Variable');
module.exports = Constant;

$extend(Constant, Variable);
function Constant(type, name, value) {
  // TypeNode type, String name, ExprNode value
  Constant.super.call(this, true, type, name);
  this._value = value;
};

$import(Constant.prototype, {
  isAssignable: function() {
    return false; 
  },

  isDefined: function() {
    return true; 
  },

  isInitialized: function() {
    return true; 
  },

  isConstant: function() {
    return true; 
  },

  value: function() {
    return this._value;
  }
});

