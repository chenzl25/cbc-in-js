var $extend = require('../util/extend');
var $import = require('../util/import');
var Variable = require('./Variable');
module.exports = UndefinedVariable;

$extend(UndefinedVariable, Variable);
function UndefinedVariable(t, name) {
  // TypeNode t, String name
  UndefinedVariable.super.call(this, false, t, name);
};

$import(UndefinedVariable.prototype, {
  isDefined: function() {
    return false;
  },

  isPrivate: function() {
    return false;
  },

  isInitialized: function() {
    return false;
  }
});
