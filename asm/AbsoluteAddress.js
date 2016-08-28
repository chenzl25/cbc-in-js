var $extend = require('../util/extend');
var $import = require('../util/import');
var Operand = require('./Operand');
module.exports = AbsoluteAddress;

$extend(AbsoluteAddress, Operand);
function AbsoluteAddress(reg) {
  // Register reg
  this._register = reg;
};

$import(AbsoluteAddress.prototype, {
  register: function() {
    return this._register;
  },

  collectStatistics: function(stats) {
    // Statistics stats
    this._register.collectStatistics(stats);
  },

  toSource: function(table) {
    // SymbolTable table
    return '*' + this._register.toSource(table);
  }
});
