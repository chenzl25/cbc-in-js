var $extend = require('../util/extend');
var $import = require('../util/import');
var BaseSymbol = require('./BaseSymbol');
module.exports = NamedSymbol;

$extend(NamedSymbol, BaseSymbol);
function NamedSymbol(name) {
  this._name = name;
};

$import(NamedSymbol.prototype, {
  name: function() {
    return this._name;
  },

  toSource: function(table) {
    return this._name;
  },

  toString: function() {
    return '#' + this._name;
  }
}); 
