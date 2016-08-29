var $extend = require('../util/extend');
var $import = require('../util/import');
var MemoryReference = require('./MemoryReference');
var SymbolTable = require('./SymbolTable');
var IntegerLiteral = require('./IntegerLiteral');
module.exports = IndirectMemoryReference;

$extend(IndirectMemoryReference, MemoryReference);
function IndirectMemoryReference(offset, base, fixed) {
  // Literal/Number offset, Register base, boolean fixed
  if (typeof offset === 'number') offset = new IntegerLiteral(offset);
  if (fixed === undefined) {
    fixed = true;
  }
  this._offset = offset;
  this._base = base;
  this._fixed = fixed;
};

IndirectMemoryReference.relocatable = function(offset, base) {
  // long offset, Register base
  return new IndirectMemoryReference(new IntegerLiteral(offset), base, false);
}

$import(IndirectMemoryReference.prototype, {

  offset: function() {
    return this._offset;
  },

  fixOffset: function(diff) {
    if (this._fixed) {
      throw new Error("must not happen: fixed = true");
    }
    var curr = this._offset.value();
    this._offset = new IntegerLiteral(curr + diff);
    this._fixed = true;
  },

  base: function() {
    return this._base;
  },

  collectStatistics: function(stats) {
    this._base.collectStatistics(stats);
  },

  toString: function() {
    return this.toSource(SymbolTable.dummy());
  },

  toSource: function(table) {
    if (! this._fixed) {
      throw new Error("must not happen: writing unfixed variable");
    }
    return (this._offset.isZero() ? "" : this._offset.toSource(table))
            + "(" + this._base.toSource(table) + ")";
  }
});
