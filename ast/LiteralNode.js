var $extend = require('../util/extend');
var $import = require('../util/import');
var ExprNode = require('./ExprNode');
var TypeNode = require('../ast/TypeNode');
module.exports = LiteralNode;

$extend(LiteralNode, ExprNode);
function LiteralNode(loc, ref) {
  this._location = loc; // Location
  this._typeNode = new TypeNode(ref); // TypeRef
};

$import(LiteralNode.prototype, {
  location: function() {
    return this._location;
  },

  /**
   * @return {Object} Type
   */

  type: function() {
    return this._typeNode.type();
  },

  typeNode: function() {
    return this._typeNode;
  },

  isConstant: function() {
    return true;
  }
});
