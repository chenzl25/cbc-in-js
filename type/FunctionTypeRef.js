var $extend = require('../util/extend');
var $import = require('../util/import');
var TypeRef = require('./TypeRef');
module.exports = FunctionTypeRef;

$extend(FunctionTypeRef, TypeRef);
function FunctionTypeRef(returnType, params) {
  // TypeRef returnType, ParamTypeRefs params
  FunctionTypeRef.super.call(this, returnType.location());
  this._returnType = returnType;
  this._params = params;
};

$import(FunctionTypeRef.prototype, {
  isFunction: function() {
    return true;
  },

  equals: function(other) {
    return other instanceof FunctionTypeRef &&
           this._returnType.equals(other.returnType()) &&
           this._params.equals(other.params());
  },

  returnType: function() {
    return this._returnType;
  },

  ParamTypeRefs: function() {
    return this._params;
  },

  toString: function() {
    var str = this._returnType.toString() + ' (';
    var paramsTyperefs = this._params.typerefs()
    for (var i = 0; i < paramsTyperefs.length; i++) {
      ref = paramsTyperefs[i];
      str += ref.toString();
      if (i !== paramsTyperefs.length-1) {
        str += ', ';
      }
    }
    if (paramsTyperefs.length === 0) {
      str += 'void';
    }
    if (this._params.isVararg()) {
      str += ', ...';
    }
    str += ')';
    return str;
  }
});

  