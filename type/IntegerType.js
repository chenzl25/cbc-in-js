var $extend = require('../util/extend');
var $import = require('../util/import');
var Type = require('./Type');
module.exports = IntegerType;

$extend(IntegerType, Type);
function IntegerType(size, isSigned, name) {
  // long size, boolean isSigned, String name
  this._size = size;
  this._isSigned = isSigned;
  this._name = name;
};

$import(IntegerType.prototype, {
  isInteger: function() {
    return true; 
  },

  isSigned: function() {
    return this._isSigned; 
  },

  isScalar: function() {
    return true; 
  },

  minValue: function() {
    return this._isSigned ? -Math.pow(2, this._size * 8 - 1) : 0;
  },


  maxValue: function() {
      return this._isSigned ? Math.pow(2, this._size * 8 - 1) - 1
                            : Math.pow(2, this._size * 8) - 1;
  },

  isInDomain: function(i) {
    return (this.minValue() <= i && i <= this.maxValue());
  },

  isSameType: function(other) {
    if (! other.isInteger()) return false;
    return this === other; // TO GHCANGE?
  },

  isCompatible: function(other) {
      return (other.isInteger() && this._size <= other.size());
  },

  isCastableTo: function(target) {
      return (target.isInteger() || target.isPointer());
  },

  size: function() {
      return this._size;
  },

  toString: function() {
      return this._name;
  }
});

