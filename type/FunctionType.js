var $extend = require('../util/extend');
var $import = require('../util/import');
var Type = require('./Type');
module.exports = FunctionType;

$extend(FunctionType, Type);
function FunctionType(ret, partypes) {
  // Type ret, ParamTypes partypes
  this._returnType = ret;
  this._paramTypes = partypes;
};

$import(FunctionType.prototype, {
  isFunction: function() {
    return true;
  },

  isCallable: function() {
    return true;
  },

  /**
   * @param {Object} other // Type
   */

  isSameType: function(other) {
    if (! other.isFunction()) return false;
    var t = other.getFunctionType();
    return t._returnType.isSameType(this._returnType)
        && t._paramTypes.isSameType(this._paramTypes);
  },

  /**
   * @param {Object} other // Type
   */

  isCompatible: function(target) {
    if (! target.isFunction()) return false;
    var t = target.getFunctionType();
    return t._returnType.isCompatible(this._returnType)
        && t._paramTypes.isSameType(this._paramTypes);
  },

  /**
   * @param {Object} other // Type
   */

  isCastableTo: function(target) {
    return target.isFunction();
  },

  returnType: function() {
    return  this._returnType;
  },

  isVararg: function() {
    return  this._paramTypes.isVararg();
  },

  acceptsArgc: function(numArgs) {
    if (this._paramTypes.isVararg()) {
        return (numArgs >= this._paramTypes.minArgc());
    } else {
        return (numArgs == this._paramTypes.argc());
    }
  },

  paramTypes: function() {
    return this._paramTypes.types();
  },

  alignment: function() {
    throw new Error("FunctionType#alignment called");
  },

  size: function() {
    throw new Error("FunctionType#size called");
  },

  toString: function() {
    var str = this._returnType.toString() + ' (';
    var paramsTypes = this._paramTypes;
    for (var i = 0; i < paramsTypes.length; i++) {
      ref = paramsTypes[i];
      str += ref.toString();
      if (i !== paramsTypes.length-1) {
        str += ', ';
      }
    }
    if (paramsTypes.length === 0) {
      str += 'void';
    }
    if (this.isVararg()) {
      str += ', ...';
    }
    str += ')';
    return str;
  }
});
