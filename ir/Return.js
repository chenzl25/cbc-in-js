var $extend = require('../util/extend');
var $import = require('../util/import');
var Stmt = require('./Stmt');
module.exports = Return;

$extend(Return, Stmt);
function Return(loc, expr) {
  // Location loc, Expr expr
  Return.super.call(this, loc);
  this._expr = expr;
};

$import(Return.prototype, {
  expr: function() {
    return this._expr;
  }
});
