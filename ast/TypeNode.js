var $extend = require('../util/extend');
var $import = require('../util/import');
var Node = require('./Node');
var Type = require('../type/Type');
var TypeRef = require('../type/TypeRef');
module.exports = TypeNode;

$extend(TypeNode, Node);
function TypeNode(ref_or_type) {
  if (ref_or_type instanceof Type) {
    this._type = ref_or_type;
  } else if (ref_or_type instanceof TypeRef) {
    this._typeRef = ref_or_type;
  } else {
    throw new Error('TypeNode constructor paramter type error');
  }
};

$import(TypeNode.prototype, {
  typeRef: function() {
    return this._typeRef;
  },

  isResolved: function() {
    return this._type? true: false;
  },

  setType: function(type) {
    if (this._type) throw new Error('TypeNode set type twice');
    this._type = type;
  },

  type: function() {
    if (!this._type) throw new Error('TypeNode type is not resolved');
    return this._type;
  },

  location: function() {
    return this._typeRef? this._typeRef.location(): null;
  },

  toString: function() {
    return this._typeRef.toString();
  }
  // accept
});