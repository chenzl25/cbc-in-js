var $extend = require('../util/extend');
var $import = require('../util/import');
var TypeRef = require('./TypeRef');
module.exports = PointerTypeRef;

$extend(PointerTypeRef, TypeRef);
function PointerTypeRef(baseType) {
  // TypeRef baseType
  PointerTypeRef.super.call(this, baseType.location());
  this.baseType = baseType;
};

$import(PointerTypeRef.prototype, {
  isPointer: function() {
    return true;
  },

  baseType: function() {
    return this.baseType;
  },

  equals: function(other) {
    if (!other instanceof PointerTypeRef) return false;
    return this.baseType.equals(other.baseType());
  },

  toString: function() {
    return this.baseType.toString() + '*';
  }
});

