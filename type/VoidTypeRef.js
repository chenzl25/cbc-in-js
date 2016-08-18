var $extend = require('../util/extend');
var $import = require('../util/import');
var TypeRef = require('./TypeRef');
module.exports = VoidTypeRef;


$extend(VoidTypeRef, TypeRef);
function VoidTypeRef(loc) {
  VoidTypeRef.super.call(this, loc);
};

$import(VoidTypeRef.prototype, {
  isVoid: function() {
    return true;
  },

  equals: function(other) {
    return other instanceof VoidTypeRef;
  },

  toString: function() {
    return 'void';
  }
});

