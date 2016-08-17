var $extend = require('../util/extend');
var $import = require('../util/import');
var ExprNode = require('./ExprNode');
var TypeNode = require('./TypeNode');
module.exports = SizeofTypeNode;

$extend(SizeofTypeNode, ExprNode);
function SizeofTypeNode(operand, type) {
  // TypeNode operand, TypeRef type
  this._operand = operand;
  this._type = new TypeNode(type);
};

$import(SizeofTypeNode.prototype, {
  /**
   * @return {Object} // Type
   */

  operand: function() {
    return this._operand.type();
  },

  /**
   * @return {Object} // TypeNode
   */

  operandTypeNode: function() {
    return this._operand;
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
    this._operand.location();
  },
  // accept
});
