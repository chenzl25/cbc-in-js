var $extend = require('../util/extend');
var $import = require('../util/import');
var Expr = require('./Expr');
var ImmediateValue = require('../asm/ImmediateValue');
var IntegerLiteral = require('../asm/IntegerLiteral');
module.exports = Int;

$extend(Int, Expr);
function Int(type, value) {
  // Type type, Number value
  Int.super.call(this, type);
  this._value = value;
};

$import(Int.prototype, {
  value: function() {
    return this._value;
  },

  isConstant: function() {
    return true;
  },

  /**
   * @return {Object} // ImmediateValue
   */
  asmValue: function() {
    return new ImmediateValue(new IntegerLiteral(this._value));
  },

  /**
   * @return {Object} // MemoryReference
   */
  memref: function() {
    throw new Error("must not happen: IntValue#memref");
  }
});
