var $extend = require('../util/extend');
var $import = require('../util/import');
var TypeRef = require('./TypeRef');
module.exports = FunctionTypeRef;

$extend(FunctionTypeRef, TypeRef);
function FunctionTypeRef(returnType, params) {
  // TypeRef returnType, ParamTypeRefs params
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
  }
});

  