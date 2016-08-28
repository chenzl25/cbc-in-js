var $extend = require('../util/extend');
var $import = require('../util/import');
var Literal = require('./Literal');
module.exports = IntegerLiteral;

$extend(IntegerLiteral, Literal);
function IntegerLiteral(n) {
  // Number n
  this._value = n;
};

$import(IntegerLiteral.prototype, {
  equals: function(other) {
    return (other instanceof IntegerLiteral)
            && this._value === other.value();
  },

  value: function() {
    return this._value;
  },

  isZero: function() {
    return this._value === 0;
  },

  plus: function(diff) {
    return new IntegerLiteral(this._value + diff);
  },

  integerLiteral: function() {
    return this;
  },

  toSource: function(table) {
    return this._value.toString();
  },

  collectStatistics: function(stats) {
    // do nothing
  }
});
