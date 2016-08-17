var $extend = require('../util/extend');
var $import = require('../util/import');
var BinaryOpNode = require('./BinaryOpNode');
module.exports = LogicalAndNode;

$extend(LogicalAndNode, BinaryOpNode);
function LogicalAndNode(left, right) {
  // ExprNode left, ExprNode right
  LogicalAndNode.super.call(this, left, '&&', right);
};

$import(LogicalAndNode.prototype, {
  // accept
});
