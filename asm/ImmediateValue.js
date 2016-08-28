var $extend = require('../util/extend');
var $import = require('../util/import');
var Operand = require('./Operand');
var IntegerLiteral = require('./IntegerLiteral');
module.exports = ImmediateValue;

$extend(ImmediateValue, Operand);
function ImmediateValue(_1) {
  // Number n or Literal
  if (typeof _1 === 'number') {
    this._expr = new IntegerLiteral(_1);
  } else {
    this._expr = _1;
  }
};

$import(ImmediateValue.prototype, {
  equals: function(other) {
    if (!(other instanceof ImmediateValue)) return false;
    return this._expr.equals(other.expr());
  },

  expr: function() {
    return this._expr;
  },

  collectStatistics: function(stats) {
    // do nothing
  },

  toSource: function(table) {
    return '$' + this._expr.toSource(table);
  }
});