var $extend = require('../util/extend');
var $import = require('../util/import');
var ExprNode = require('./ExprNode');
var TypeNode = require('./TypeNode');
module.exports = SizeofExprNode;

$extend(SizeofExprNode, ExprNode);
function SizeofExprNode(expr, type) {
  // ExprNode expr, TypeRef type
  this._expr = expr;
  this._type = new TypeNode(type);
};

$import(SizeofExprNode.prototype, {
  expr: function() {
    return this._expr;
  },

  setExpr: function(expr) {
    this._expr = expr;
  },

  /**
   * @return {Object} // Type
   */

  type: function() {
    return this._type.type();
  },

  /**
   * @return {Object} // TypeNode
   */

  typeNode: function() {
    return this._type;
  },

  location: function() {
    return this._expr.location();
  },
   
});

