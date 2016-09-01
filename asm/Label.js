var $extend = require('../util/extend');
var $import = require('../util/import');
var Assembly = require('./Assembly');
var UnnamedSymbol = require('./UnnamedSymbol');
module.exports = Label;

$extend(Label, Assembly);
function Label(sym) {
  // Symbol sym
  this._symbol = sym || new UnnamedSymbol();
};

$import(Label.prototype, {
  symbol: function() {
    return this._symbol;
  },

  isLabel: function() {
    return true;
  },

  toSource: function(table) {
    return this._symbol.toSource(table) + ':';
  },

  toString: function() {
    return this._symbol.toString();
  }
});
