var $extend = require('../util/extend');
var $import = require('../util/import');
var AbstractAssignNode = require('./AbstractAssignNode');
module.exports = OpAssignNode;

$extend(OpAssignNode, AbstractAssignNode);
function OpAssignNode(lhs, op,  rhs) {
  // ExprNode lhs, String op, ExprNode rhs
  OpAssignNode.super.call(this, lhs, rhs);
  this._operator = op;
};

$import(OpAssignNode.prototype, {
  operator: function() {
    return this._operator;
  }
   
});

