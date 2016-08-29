var $extend = require('../util/extend');
var $import = require('../util/import');
var Expr = require('./Expr');
module.exports = Str;

$extend(Str, Expr);
function Str(type, entry) {
  // Type type, ConstantEntry entry
  Str.super.call(this, type);
  this._entry = entry;
};

$import(Str.prototype, {
  entry: function() {
    return this._entry;
  },

  /**
   * @return {Object} // Symbol
   */
  symbol: function() {
    return this._entry.symbol();
  },

  isConstant: function() {
    return true;
  },

  /**
   * @return {Object} // MemoryReference
   */
  memref: function() {
    return this._entry.memref();
  },

  /**
   * @return {Object} // Operand
   */ 
  address: function() {
    return this._entry.address();
  },

  /**
   * @return {Object} // ImmediateValue
   */
  asmValue: function() {
    return this._entry.address();
  }
});
