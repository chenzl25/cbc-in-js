var $extend = require('../util/extend');
var $import = require('../util/import');
var Stmt = require('./Stmt');
module.exports = Load;

$extend(Load, Stmt);
function Load(loc, to, from) {
  // Location loc, Reg to, Expr from
  Load.super.call(this, loc);
  this._from = from;
  this._to = to;
};

$import(Load.prototype, {
  from: function() {
    return this._from;
  },

  to: function() {
    return this._to;
  },
});
