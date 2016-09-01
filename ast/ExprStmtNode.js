var $extend = require('../util/extend');
var $import = require('../util/import');
var StmtNode = require('./StmtNode');
module.exports = ExprStmtNode;

$extend(ExprStmtNode, StmtNode);
function ExprStmtNode(loc, expr) {
  // Location loc, ExprNode expr
  ExprStmtNode.super.call(this, loc);
  this._expr = expr;
};

$import(ExprStmtNode.prototype, {
  expr: function() {
    return this._expr;
  },

  setExpr: function(expr) {
    this._expr = expr;
  }
   
});

