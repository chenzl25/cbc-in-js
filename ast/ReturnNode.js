var $extend = require('../util/extend');
var $import = require('../util/import');
var StmtNode = require('./StmtNode');
module.exports = ReturnNode;

$extend(ReturnNode, StmtNode);
function ReturnNode(loc, expr) {
  // Location loc, ExprNode expr
  ReturnNode.super.call(this, loc);
  this._expr = expr;
};

$import(ReturnNode.prototype, {
  expr: function() {
    return this._expr;
  },

  setExpr: function(expr) {
    this._expr = expr;
  }
   
});
