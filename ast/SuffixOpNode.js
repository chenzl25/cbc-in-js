var $extend = require('../util/extend');
var $import = require('../util/import');
var UnaryArithmeticOpNode = require('./UnaryArithmeticOpNode');
module.exports = SuffixOpNode;

$extend(SuffixOpNode, UnaryArithmeticOpNode);
function SuffixOpNode(op, expr) {
  // String op, ExprNode expr
  SuffixOpNode.super.call(this, op, expr);
};

$import(SuffixOpNode.prototype, {
   
})
