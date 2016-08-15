var $extend = require('../util/extend');
var $import = require('../util/import');
var ExprNode = require('./ExprNode');
var TypeNode = require('../ast/TypeNode');
module.exports = LiteralNode;

$extend(LiteralNode, ExprNode);
function LiteralNode(loc, ref) {
  this.location = loc; // Location
  this.typeNode = new TypeNode(ref); // TypeRef
};

$import(LiteralNode.prototype, {
  location: function() {
    return this.location;
  },

  /**
   * @return {Object} Type
   */

  type: function() {
    return this.typeNode.type();
  },

  typeNode: function() {
    return this.typeNode;
  },

  isConstant: function() {
    return true;
  }
});
