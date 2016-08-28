var $extend = require('../util/extend');
var $import = require('../util/import');
var OperandPattern = require('./OperandPattern');
module.exports = Operand;

$extend(Operand, OperandPattern);
function Operand() {
};

$import(Operand.prototype, {
  toSource: function(table) {
    // SymbolTable table
  },

  isRegister: function() {
    return false;
  },

  isMemoryReference: function() {
    return false;
  },

  integerLiteral: function() {
    return null;
  },

  collectStatistics: function(stats) {
    // Statistics stats
  },

  match: function(operand) {
    return this === operand;
  }
});

