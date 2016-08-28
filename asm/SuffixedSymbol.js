var $extend = require('../util/extend');
var $import = require('../util/import');
var Symbol = require('./Symbol');
module.exports = SuffixedSymbol;

$extend(SuffixedSymbol, Symbol);
function SuffixedSymbol(base, suffix) {
  // Symbol base, String suffix
  this._base = base;
  this._suffix = suffix;
};

$import(SuffixedSymbol.prototype, {
  isZero: function() {
    return false;
  },

  collectStatistics: function(stats) {
    this._base.collectStatistics(stats);
  },

  plus: function(n) {
    throw new Error("must not happen: SuffixedSymbol.plus called");
  },

  name: function() {
    return this._base.nama();
  },

  toSource: function(table) {
    return this._base.toSource(table) + suffix;
  },

  toString: function() {
    return this._base.toString() + suffix;
  }
});

