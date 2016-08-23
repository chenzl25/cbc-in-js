var $extend = require('../util/extend');
var $import = require('../util/import');
var Stmt = require('./Stmt');
module.exports = Assign;

$extend(Assign, Stmt);
function Assign(loc, lhs, rhs) {
  // Location loc, Expr lhs, Expr rhs
  Assign.super.call(this, loc);
  this._lhs = lhs;
  this._rhs = rhs;
};

$import(Assign.prototype, {
  lhs: function() {
    return this._lhs;
  },

  rhs: function() {
    return this._rhs;
  },
});
