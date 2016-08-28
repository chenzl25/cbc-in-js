var NamedSymbol = require('./NamedSymbol');
module.exports = SymbolTable;

function SymbolTable(base) {
  // String base
  this._base = base;
  this._map = new Map(); // UnnamedSymbol -> String
  this.seq = 0;
};

SymbolTable.DUMMY_SYMBOL_BASE = 'L';
SymbolTable.dummy = new SymbolTable(SymbolTable.DUMMY_SYMBOL_BASE);

SymbolTable.prototype = {
  newSymbol: function() {
    return new NamedSymbol(this.newString());
  },

  symbolString: function(sym) {
    // UnnamedSymbol sym
    var str = this._map.get(sym);
    if (str != null) {
      return str;
    } else {
      var newStr = this.newStr();
      this._map.set(sym, newStr);
      return newStr;
    }
  },

  newString: function() {
    return this._base + this._seq++;
  }
};
