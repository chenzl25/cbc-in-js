var $extend = require('../util/extend');
var $import = require('../util/import');
var UnaryOpNode = require('./UnaryOpNode');
module.exports = UnaryArithmeticOpNode;

$extend(UnaryArithmeticOpNode, UnaryOpNode);
function UnaryArithmeticOpNode(op, expr) {
  // String op, ExprNode expr
  UnaryArithmeticOpNode.super.call(this, op, expr);
  this._amount = 1;
};

$import(UnaryArithmeticOpNode.prototype, {
  setExpr: function(expr) {
    this._expr = expr;
  },

  amount: function() {
    return this._amount;
  },

  setAmount: function(amount) {
    this._amount = amout;
  }
})
