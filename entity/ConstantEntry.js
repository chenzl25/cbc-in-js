module.exports = ConstantEntry;

function ConstantEntry(val) {
  this._value = val; // String
  this._symbol;      // Symbol
  this._memref;      // Symbol
  this._address;     // ImmediateValue
};

ConstantEntry.prototype = {
  value: function() {
    return this._value;
  },

  setSymbol: function(sym) {
    this._symbol = sym;
  },

  symbol: function() {
    if (this._symbol == null) {
      throw new Error("must not happen: symbol == null");
    }
    return this._symbol;
  },

  /**
   * @param {Object} mem // MemoryReference
   */

  setMemref: function(mem) {
    this._memref = mem;
  },

  memref: function() {
    if (this._memref == null) {
      throw new Error("must not happen: memref == null");
    }
    return this._memref;
  },


  /**
   * @param {Object} imm // ImmediateValue
   */

  setAddress: function(imm) {
    this._address = imm;
  },

  address: function() {
    return this._address;
  }
};
