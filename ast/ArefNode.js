var $extend = require('../util/extend');
var $import = require('../util/import');
var LHSNode = require('./LHSNode');
module.exports = ArefNode;

$extend(ArefNode, LHSNode);
function ArefNode(expr, index) {
  // ExprNode expr, ExprNode index
  this._expr = expr;
  this._index = index;
};

$import(ArefNode.prototype, {
  expr: function() {
    return this._expr;
  },

  index: function() {
    return this._index;
  },

  isMultiDimension: function() {
    return (this._expr instanceof ArefNode) && 
           !this._expr.origType().isPointer();
  },

  baseExpr: function() {
    return this.isMultiDimension() ? this._expr.baseExpr() : this._expr;
  },

  elementSize: function() {
    return this.origType().allocSize();
  },

  length: function() {
    return this._expr.origType().length();
  },

  origType: function() {
    return this._expr.origType().baseType();
  },

  location: function() {
    return this._expr.location();
  }
   
});

