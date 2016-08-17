var $extend = require('../util/extend');
var $import = require('../util/import');
var Node = require('./Node');
var TypeNode = require('./TypeNode');
module.exports = TypeDefinition;

$extend(TypeDefinition, Node);
function TypeDefinition(loc, ref, name) {
  // Location loc, TypeRef ref, String name
  this._location = loc;
  this._name = name;
  this._typeNode = new TypeNode(ref);
};

$import(TypeDefinition.prototype, {
  name: function() {
    return this._name;
  },

  location: function() {
    return this._location;
  },

  typeNode: function() {
    return this._typeNode;
  },

  typeRef: function() {
    return this._typeNode.typeRef();
  },

  type: function() {
    return this._typeNode.type();
  },

  /**
   * @return {Object} Type
   */
  
  definingType() {
    throw new Error('TypeDefinition abstract method call: definingType');
  }
  // accept
});
