var $extend = require('../util/extend');
var $import = require('../util/import');
var Type = require('./Type');
module.exports = ArrayType;

$extend(ArrayType, Type);
function ArrayType(baseType, length, pointerSize) {
  if (pointerSize == undefined) {
    pointerSize = length;
    length = undefined;
  }
  this._baseType = baseType;
  this._length = length;
  this._pointerSize = pointerSize;
};

$import(ArrayType.prototype, {
  isArray: function() {
    return true;
  },

  isAllocatedArray: function() {
    return this._length != undefined &&
           (!this._baseType.isArray() || this._baseType.isAllocatedArray());
  },

  isIncompleteArray: function() {
    if (! this._baseType.isArray()) return false;
    return !this._baseType.isAllocatedArray();
  },

  baseType: function() {
    return this._baseType;
  },

  length: function() {
    return this._length;
  },

  // Value size as pointer
  size: function() {
    return this._pointerSize;
  },

  // Value size as allocated array
  allocSize: function() {
    if (this._length == undefined) {
      return this.size();
    } else {
      return this._baseType.allocSize() * this._length;
    }
  },

  alignment: function() {
    return this._baseType.alignment();
  },

  equals: function(other) {
    if (! (other instanceof ArrayType)) return false;
    return (this._baseType.equals(other._baseType) && 
            this._length === other._length);
  },

  isSameType: function(other) {
    // length is not important
    if (!other.isPointer() && !other.isArray()) return false;
    return this._baseType.isSameType(other.baseType());
  },

  isCompatible: function(target) {
    if (!target.isPointer() && !target.isArray()) return false;
    if (target.baseType().isVoid()) return true;
    return this._baseType.isCompatible(target.baseType())
            && this._baseType.size() === target.baseType().size();
  },

  isCastableTo: function(target) {
    return target.isPointer() || target.isArray();
  },

  toString: function() {
    return this._baseType.toString() + 
          '[' + 
          (this._length?this._length:'') + 
          ']';
  }
});
