var $extend = require('../util/extend');
var $import = require('../util/import');
var MemoryReference = require('./MemoryReference');
var SymbolTable = require('./SymbolTable');
module.exports = DirectMemoryReference;

$extend(DirectMemoryReference, MemoryReference);
function DirectMemoryReference(val) {
  // Literal val
  this._value = val;
};

$import(DirectMemoryReference.prototype, {
  value: function() {
    return this._value;
  },

  collectStatistics: function(stats) {
    this._value.collectStatistics(stats);
  },

  fixOffset: function(diff) {
    throw new Error("DirectMemoryReference#fixOffset");
  },

  toSource: function(table) {
    return this._value.toSource(table);
  },

  toString: function() {
    return this.toSource(SymbolTable.dummy());
  }
});

