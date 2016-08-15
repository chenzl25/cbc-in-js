var $extend = require('../util/extend');
var $import = require('../util/import');
var Node = require('./Node');
var Type = require('../type/Type');
var TypeRef = require('../type/TypeRef');
module.exports = TypeNode;

$extend(TypeNode, Node);
function TypeNode(ref_or_type) {
  if (ref_or_type instanceof Type) {
    this.type = ref_or_type;
  } else if (ref_or_type instanceof TypeRef) {
    this.typeRef = ref_or_type;
  } else {
    throw new Error('TypeNode constructor paramter type error');
  }
};

$import(TypeNode, {
  typeRef: function() {
    return this.typeRef;
  },

  isResolved: function() {
    return this.type? true: false;
  },

  setType: function(type) {
    if (this.type) throw new Error('TypeNode set type twice');
    this.type = type;
  },

  type: function() {
    if (!this.type) throw new Error('TypeNode type is not resolved');
    return this.type;
  },

  location: function() {
    return this.typeRef? this.typeRef.location(): null;
  }
  // accept
});