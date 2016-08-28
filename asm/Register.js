var $extend = require('../util/extend');
var $import = require('../util/import');
var Operand = require('./Operand');
module.exports = Register;

// Interface
$extend(Register, Operand);
function Register() {

};

$import(Register.prototype, {
  isRegister: function() {
    return true;
  },

  collectStatistics(stats) {
    stats.registerUsed(this);
  },

  toSource: function(syms) {
    // SymbolTable syms
  },
});

