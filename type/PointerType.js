var $extend = require('../util/extend');
var $import = require('../util/import');
var Type = require('./Type');
module.exports = PointerType;

$extend(PointerType, Type);
function PointerType(size, baseType) {
  this._size = size;
  this._baseType = baseType;
};

$import(PointerType.prototype, {
  isPointer: function() {
    return true; 
  },

  isScalar: function() {
    return true; 
  },

  isSigned: function() {
    return false; 
  },

  isCallable: function() {
    return this._baseType.isFunction(); 
  },

  size: function() {
    return this._size;
  },

  baseType: function() {
    return this._baseType;
  },

  equals: function(other) {
    if (! (other instanceof PointerType)) return false;
    return this._baseType.equals(other.getPointerType().baseType());
  },

  /**
   * @param {Object} other // Type
   * @return {Boolean}
   */

  isSameType: function(other) {
    if (!other.isPointer()) return false;
    return this._baseType.isSameType(other.baseType());
  },


  isCompatible: function(other) {
    if (!other.isPointer()) return false;
    if (this._baseType.isVoid()) return true;
    if (other.baseType().isVoid()) return true;
    return this._baseType.isCompatible(other.baseType());
  },

  isCastableTo: function(other) {
    return other.isPointer() || other.isInteger();
  },

  toString: function() {
    return this._baseType.toString() + "*";
  }
});
