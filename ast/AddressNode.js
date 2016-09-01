var $extend = require('../util/extend');
var $import = require('../util/import');
var ExprNode = require('./ExprNode');
module.exports = AddressNode;

$extend(AddressNode, ExprNode);
function AddressNode(expr) {
  this._expr = expr // ExprNode
  this._type; // Type
};

$import(AddressNode.prototype, {
  expr: function() {
    return this._expr;
  },

  type: function() {
    if (this._type == null) throw new Error('type is null');
    return this._type;
  },

  /** Decides type of this node.
   * This method is called from DereferenceChecker. */
  setType: function(type) {
    if (this._type != null) throw new Error("type set twice");
    this._type = type;
  },

  location: function() {
    return this._expr.location();
  },
   
});

