var $extend = require('../util/extend');
var $import = require('../util/import');
var ExprNode = require('./ExprNode');
module.exports = BinaryOpNode;

$extend(BinaryOpNode, ExprNode);
function BinaryOpNode(left, op, right) {
  // ExprNode left, String op, ExprNode right
  this._operator = op;
  this._left = left;
  this._right = right;
  this._type;
};

$import(BinaryOpNode.prototype, {
  operator: function() {
    return this._operator;
  },

  type: function() {
    return (this._type != null) ? this._type : this._left.type();
  },

  setType: function(type) {
    if (this._type != null)
      throw new Error("BinaryOp#setType called twice");
    this._type = type;
  },

  left: function() {
    return this._left;
  },

  setLeft: function(left) {
    this._left = left;
  },

  right: function() {
    return this._right;
  },

  setRight: function(right) {
    this._right = right;
  },

  location: function() {
    return this._left.location();
  },
   
});

