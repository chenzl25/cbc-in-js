var $extend = require('../util/extend');
var $import = require('../util/import');
var Expr = require('./Expr');
var Type = require('../asm/Type');
module.exports = Reg;

$extend(Reg, Expr);
function Reg(name) {
  // Type type
  Reg.super.call(this, Type.INT32);
  this._name = name;
};

Reg.seq = 0;
Reg.prefix = '$r';
Reg.tmp = function tmp() {
  return new Reg(Reg.prefix + Reg.seq++);
}

$import(Reg.prototype, {
  isReg: function() {
    return true;
  },

  name: function() {
    return this._name;
  }
});
