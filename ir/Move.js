var $extend = require('../util/extend');
var $import = require('../util/import');
var Stmt = require('./Stmt');
module.exports = Move;

$extend(Move, Stmt);
function Move(loc, from, to) {
  // Location loc, Expr from, Reg to
  Move.super.call(this, loc);
  this._from = from;
  this._to = to;
};

$import(Move.prototype, {
  from: function() {
    return this._from;
  },

  to: function() {
    return this._to;
  },
});
