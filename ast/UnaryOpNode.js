var $extend = require('../util/extend');
var $import = require('../util/import');
var ExprNode = require('./ExprNode');
module.exports = UnaryOpNode;

$extend(UnaryOpNode, ExprNode);
function UnaryOpNode(op, expr) {
  // String op, ExprNode expr
  this._operator = op;
  this._expr = expr;
  this._opType;
};

$import(UnaryOpNode.prototype, {
  operator: function() {
    return this._operator;
  },

  type: function() {
    return this._expr.type();
  },

  setOpType: function(t) {
    // Type t
    this._opType =t;
  },

  opType: function() {
    return this._opType;
  },

  expr: function() {
    return this._expr;
  },

  setExpr: function(expr) {
    this._expr = expr;
  },

  location: function() {
    return this._expr.location();
  }
   
});

