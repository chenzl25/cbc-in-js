var $extend = require('../util/extend');
var $import = require('../util/import');
var Stmt = require('./Stmt');
module.exports = ExprStmt;

$extend(ExprStmt, Stmt);
function ExprStmt(loc, expr) {
  // Location loc, Expr expr
  ExprStmt.super.call(this, loc);
  this._expr = expr;
};

$import(ExprStmt.prototype, {
  expr: function() {
    return this._expr;
  }
});

