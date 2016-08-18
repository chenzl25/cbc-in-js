var $extend = require('../util/extend');
var $import = require('../util/import');
var TypeRef = require('./TypeRef');
var Location = require('../ast/Location');
module.exports = StructTypeRef;

$extend(StructTypeRef, TypeRef);
function StructTypeRef(loc, name) {
  // Location loc, String name
  if (!(loc instanceof Location)) {
    name = loc;
    loc = null;
  }
  StructTypeRef.super.call(this, loc);
  this._name = name;
};

$import(StructTypeRef.prototype, {
  isStruct: function() {
    return true;
  },

  name: function() {
    return this._name;
  },

  equals: function(other) {
    return (other instanceof StructTypeRef) && 
           this._name === other._name;
  },

  toString: function() {
    return 'struct ' + this._name;
  }
});