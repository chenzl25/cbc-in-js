var $extend = require('../util/extend');
var $import = require('../util/import');
var BinaryOpNode = require('./BinaryOpNode');
module.exports = LogicalOrNode;

$extend(LogicalOrNode, BinaryOpNode);
function LogicalOrNode(left, right) {
  // ExprNode left, ExprNode right
  LogicalOrNode.super.call(this, left, '||', right);
};

$import(LogicalOrNode.prototype, {
   
});
