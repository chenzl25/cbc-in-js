var $extend = require('../util/extend');
var $import = require('../util/import');
var BaseSymbol = require('./BaseSymbol');
module.exports = UnnamedSymbol;

$extend(UnnamedSymbol, BaseSymbol);
function UnnamedSymbol() {
  UnnamedSymbol.super.call(this);
  this._str = UnnamedSymbol.str + UnnamedSymbol.seq++;
};

UnnamedSymbol.str = 'L';
UnnamedSymbol.seq = 0;

$import(UnnamedSymbol.prototype, {
  name: function() {
    throw new Error("unnamed symbol");
  },

  toSource: function(table) {
    if (table) {
      return table.symbolString(this);
    } else {
      throw new Error("UnnamedSymbol#toSource() called");
    }
  },

  toString: function() {
    return this._str;
  }
});