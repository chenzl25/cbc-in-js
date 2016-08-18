var $extend = require('../util/extend');
var $import = require('../util/import');
var TypeRef = require('./TypeRef');
var Location = require('../ast/Location');
module.exports = UnionTypeRef;

$extend(UnionTypeRef, TypeRef);
function UnionTypeRef(loc, name) {
  // Location loc, String name
  if (!(loc instanceof Location)) {
    name = loc;
    loc = null;
  }
  UnionTypeRef.super.call(this, loc);
  this._name = name;
};

$import(UnionTypeRef.prototype, {
  isUnion: function() {
    return true;
  },

  name: function() {
    return this._name;
  },

  equals: function(other) {
    return (other instanceof UnionTypeRef) && 
           this._name === other._name;
  },

  toString: function() {
    return 'union ' + this._name;
  }
});