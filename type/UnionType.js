var $extend = require('../util/extend');
var $import = require('../util/import');
var CompositeType = require('./CompositeType');
module.exports = UnionType;

$extend(UnionType, CompositeType);
function UnionType(name, membs, loc) {
  // String name, Slot[] membs, Location loc
  UnionType.super.call(this, name, membs, loc);
};

$import(UnionType.prototype, {
  isUnion: function() {
    return true;
  },

  isSameType: function(other) {
    if (! other.isUnion()) return false;
    return this === other;
  },

  computeOffsets: function() {
    var maxSize = 0;
    var maxAlign = 1;
    for (var s of this.members()) {
      s.setOffset(0);
      maxSize = Math.max(maxSize, s.allocSize());
      maxAlign = Math.max(maxAlign, s.alignment());
    }
    this._cachedSize = this.align(maxSize, maxAlign);
    this._cachedAlign = maxAlign;
  },

  align(n, alignment) {
    return (n + alignment - 1) / alignment * alignment;
  },

  toString: function() {
    return 'union ' + this._name;
  }
});

