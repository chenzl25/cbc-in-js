var $extend = require('../util/extend');
var $import = require('../util/import');
var TypeRef = require('./TypeRef');
module.exports = ArrayTypeRef;

$extend(ArrayTypeRef, TypeRef);
function ArrayTypeRef(baseType, length) {
  // TypeRef baseType, Number length
  ArrayTypeRef.super.call(this, baseType.location());
  this._baseType = baseType;
  this._length = length;
  if (this._length && this._length < 0) {
    throw new Error("negative array length");
  }
};

$import(ArrayTypeRef.prototype, {
  isArray: function() {
    return true;
  },

  equals: function(other) {
    return (other instanceof ArrayTypeRef) &&
           this._length === other._length;
  },

  baseType: function() {
    return this._baseType;
  },

  length: function() {
    return this._length;
  },

  isLengthUndefined: function() {
    return (length == undefined);
  }
});
