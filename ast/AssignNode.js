var $extend = require('../util/extend');
var $import = require('../util/import');
var AbstractAssignNode = require('./AbstractAssignNode');
module.exports = AssignNode;

$extend(AssignNode, AbstractAssignNode);
function AssignNode(lhs, rhs) {
  // ExprNode lhs, ExprNode rhs
  AssignNode.super.call(this, lhs, rhs);
};

$import(AssignNode.prototype, {
   
});

