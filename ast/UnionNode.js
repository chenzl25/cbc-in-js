var $extend = require('../util/extend');
var $import = require('../util/import');
var CompositeTypeDefinition = require('./CompositeTypeDefinition');
var UnionType = require('../type/UnionType');
module.exports = UnionNode;

$extend(UnionNode, CompositeTypeDefinition);
function UnionNode(loc, ref, name, membs) {
  // Location loc, TypeRef ref, String name, Slot[] membs
  UnionNode.super.call(this, loc, ref, name, membs);
};

$import(UnionNode.prototype, {
  kind: function() {
    return 'union';
  },

  isUnion: function() {
    return true;
  },

  definingType: function() {
    return new UnionType(this.name(), this.members(), this.location());
  },
  // accept
});

