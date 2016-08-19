var $extend = require('../util/extend');
var $import = require('../util/import');
var NamedType = require('./NamedType');
module.exports = UserType;

$extend(UserType, NamedType);
function UserType(name, real, loc) {
  // String name, TypeNode real, Location loc
  UserType.super.call(this, name, real);
  this._real = real;
};

$import(UserType.prototype, {
  realType: function() {
    return this._real.type();
  },

  toString: function() {
    return this._name;
  },

  /**
   * Forward methods to real type.
   */
   
  size: function() {
    return this.realType().size(); 
  },

  allocSize: function() {
    return this.realType().allocSize(); 
  },

  alignment: function() {
    return this.realType().alignment(); 
  },


  isVoid: function() {
    return this.realType().isVoid(); 
  },

  isInt: function() {
    return this.realType().isInt(); 
  },

  isInteger: function() {
    return this.realType().isInteger(); 
  },

  isSigned: function() {
    return this.realType().isSigned(); 
  },

  isPointer: function() {
    return this.realType().isPointer(); 
  },

  isArray: function() {
    return this.realType().isArray(); 
  },

  isAllocatedArray: function() {
    return this.realType().isAllocatedArray(); 
  },

  isCompositeType: function() {
    return this.realType().isCompositeType(); 
  },

  isStruct: function() {
    return this.realType().isStruct(); 
  },

  isUnion: function() {
    return this.realType().isUnion(); 
  },

  isUserType: function() {
    return true; 
  },

  isFunction: function() {
    return this.realType().isFunction(); 
  },

  isCallable: function() {
    return this.realType().isCallable(); 
  },

  isScalar: function() {
    return this.realType().isScalar(); 
  },

  baseType: function() {
    return this.realType().baseType(); 
  },

  isSameType: function(other) {
      return this.realType().isSameType(other);
  },

  isCompatible: function(other) {
      return this.realType().isCompatible(other);
  },

  isCastableTo: function(other) {
      return this.realType().isCastableTo(other);
  }
});
