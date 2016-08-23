var $extend = require('../util/extend');
var $import = require('../util/import');
var Stmt = require('./Stmt');
module.exports = CJump;

$extend(CJump, Stmt);
function CJump(loc, cond, thenLabel, elseLabel) {
  // Location loc, Expr cond, Label thenLabel, Label elseLabel
  CJump.super.call(this, loc);
  this._cond = cond;
  this._thenLabel = thenLabel;
  this._elseLabel = elseLabel;
};

$import(CJump.prototype, {
  cond: function() {
    return this._cond;
  },

  thenLabel: function() {
    return this._thenLabel;
  },

  elseLabel: function() {
    return this._elseLabel;
  },
});
