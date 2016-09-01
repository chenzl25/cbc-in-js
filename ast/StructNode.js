var $extend = require('../util/extend');
var $import = require('../util/import');
var CompositeTypeDefinition = require('./CompositeTypeDefinition');
var StructType = require('../type/StructType');
module.exports = StructNode;

$extend(StructNode, CompositeTypeDefinition);
function StructNode(loc, ref, name, membs) {
  // Location loc, TypeRef ref, String name, Slot[] membs
  StructNode.super.call(this, loc, ref, name, membs);
};

$import(StructNode.prototype, {
  kind: function() {
    return 'struct';
  },

  isStruct: function() {
    return true;
  },

  definingType: function() {
    return new StructType(this.name(), this.members(), this.location());
  },
   
});

