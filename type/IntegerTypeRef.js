var $extend = require('../util/extend');
var $import = require('../util/import');
var TypeRef = require('./TypeRef');
module.exports = IntegerTypeRef;

$extend(IntegerTypeRef, TypeRef);
function IntegerTypeRef(name, loc) {
  this.super(loc);
  this.name = name;
};

$import(IntegerTypeRef.prototype, {
  name: function() {
    return this.name;
  },

  equals: function(other) {
    if (!(other instanceof IntegerTypeRef)) return false;
    return other.name() === this.name;
  }
});

IntegerTypeRef.charRef = function(loc) {
    return new IntegerTypeRef("char", loc);
}

IntegerTypeRef.shortRef = function(loc) {
    return new IntegerTypeRef("short", loc);
}

IntegerTypeRef.intRef = function(loc) {
    return new IntegerTypeRef("int", loc);
}

IntegerTypeRef.longRef = function(loc) {
    return new IntegerTypeRef("long", loc);
}

IntegerTypeRef.ucharRef = function(loc) {
    return new IntegerTypeRef("unsigned char", loc);
}

IntegerTypeRef.ushortRef = function(loc) {
    return new IntegerTypeRef("unsigned short", loc);
}

IntegerTypeRef.uintRef = function(loc) {
    return new IntegerTypeRef("unsigned int", loc);
}

IntegerTypeRef.ulongRef = function(loc) {
  return new IntegerTypeRef("unsigned long", loc);
}


