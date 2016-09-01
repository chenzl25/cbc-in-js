var $extend = require('../util/extend');
var $import = require('../util/import');
var ExprNode = require('./ExprNode');
var TypeNode = require('./TypeNode');
var Type = require('../type/Type');
module.exports = CastNode;

$extend(CastNode, ExprNode);
function CastNode(type_or_typeNode, expr) {
  // Type t, ExprNode expr
  if (type_or_typeNode instanceof Type) {
    type_or_typeNode = new TypeNode(type_or_typeNode);
  } else if (type_or_typeNode instanceof TypeNode) {
    // do nothinf
  } else {
    throw new Error('CastNode constructor parameter error');
  }
  this._typeNode = type_or_typeNode;
  this._expr = expr;
};

$import(CastNode.prototype, {
  type: function() {
    return this._typeNode.type();
  },

  typeNode: function() {
    return this._typeNode;
  },

  expr: function() {
    return this._expr;
  },

  isLvalue: function() {
    return this._expr.isLvalue();
  },

  isAssignable: function() {
    return this._expr.isAssignable();
  },

  isEffectiveCast: function() {
    return this.type().size() > this._expr.type().size();
  },

  location: function() {
    return this._typeNode.location();
  },
   
});
