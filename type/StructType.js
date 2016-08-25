var $extend = require('../util/extend');
var $import = require('../util/import');
var CompositeType = require('./CompositeType');
module.exports = StructType;

$extend(StructType, CompositeType);
function StructType(name, membs, loc) {
  // String name, Slot[] membs, Location loc
  StructType.super.call(this, name, membs, loc);
};

$import(StructType.prototype, {
  isStruct: function() {
    return true;
  },

  isSameType: function(other) {
    if (! other.isStruct()) return false;
    return this === other.getStructType(); // TO CHANGE
  },

  computeOffsets: function() {
    var offset = 0;
    var maxAlign = 1;
    for (var s of this.members()) {
      offset = this.align(offset, s.allocSize());
      s.setOffset(offset);
      offset += s.allocSize();
      maxAlign = Math.max(maxAlign, s.alignment());
    }
    this._cachedSize = this.align(offset, maxAlign);
    this._cachedAlign = maxAlign;
  },

  align(n, alignment) {
    return Math.floor((n + alignment - 1) / alignment) * alignment;
  },

  toString: function() {
    return 'struct ' + this._name;
  }
});
