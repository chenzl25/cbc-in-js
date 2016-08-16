var $extend = require('../util/extend');
var $import = require('../util/import');
var UnaryArithmeticOpNode = require('./UnaryArithmeticOpNode');
module.exports = PrefixOpNode;

$extend(PrefixOpNode, UnaryArithmeticOpNode);
function PrefixOpNode(op, expr) {
  // String op, ExprNode expr
  PrefixOpNode.super.call(this, op, expr);
};

$import(PrefixOpNode.prototype, {
  //accept
});
