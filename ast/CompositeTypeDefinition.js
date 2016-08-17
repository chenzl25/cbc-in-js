var $extend = require('../util/extend');
var $import = require('../util/import');
var TypeDefinition = require('./TypeDefinition');
var UserTypeRef = require('../type/UserTypeRef');
var TypeNode =require('./TypeNode');
module.exports = CompositeTypeDefinition;

$extend(CompositeTypeDefinition, TypeDefinition);
function CompositeTypeDefinition(loc, ref, name, membs) {
  // Location loc, TypeRef ref, String name, Slot[] membs
  CompositeTypeDefinition.super.call(this, loc, ref, name);
  this._members = membs;
};

$import(CompositeTypeDefinition.prototype, {
  isCompositeType: function() {
    return true;
  },

  kind: function() {
    throw new Error('CompositeTypeDefinition abstract method call: kind');
  },

  members() {
    return this._members;
  }
});
