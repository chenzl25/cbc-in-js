var $extend = require('../util/extend');
var $import = require('../util/import');
var NamedType = require('./NamedType');
var Type = require('./Type');
module.exports = CompositeType;

$extend(CompositeType, NamedType);
function CompositeType(name, membs, loc) {
  // String name, Slot[] membs, Location loc
  CompositeType.super.call(this, name, loc);
  this._members = membs;
  this._cachedSize = Type.sizeUnknown;
  this._cachedAlign = Type.sizeUnknown;
  this._isRecursiveChecked = false;
};

$import(CompositeType.prototype, {
  isCompositeType: function() {
    return true;
  },

  isSameType: function(other) {
    return this.compareMemberTypes(other, "isSameType");
  },

  isCompatible: function(target) {
    return this.compareMemberTypes(target, "isCompatible");
  },

  isCastableTo: function(target) {
    return this.compareMemberTypes(target, "isCastableTo");
  },

  compareMemberTypes: function(other, cmpMethod) {
    if (this.isStruct() && !other.isStruct()) return false;
    if (this.isUnion() && !other.isUnion()) return false;
    var otherType = other.getCompositeType();
    if (this._members.size() !== otherType.size()) return false;
    for (var i = 0; i < this._members.size(); i++) {
      if (! this.compareTypesBy(cmpMethod, this._members[i], otherType._members[i])) 
        return false;
    }
    return true;
  },

  compareTypesBy: function(cmpMethod, t, tt) {
    return t[cmpMethod](tt);
  },

  size: function() {
    if (this._cachedSize === Type.sizeUnknown) {
      this.computeOffsets();
    }
    return this._cachedSize;
  },

  alignmemt: function() {
    if (this._cachedAlign === Type.sizeUnknown) {
      this.computeOffsets();
    }
    return this.cachedAlign;
  },

  members: function() {
    return this._members;
  },

  memberTypes: function() {
    var result = [];
    for (var s of this._members) {
      result.push(s.type());
    }
    return result;
  },

  hasMember: function(name) {
    return this.get(name) != null;
  },

  memberType: function(name) {
    return this.fetch(name).type();
  },

  memberOffset: function(name) {
    var s = this.fetch(name);
    if (s.offset() == Type.sizeUnknown) {
      this.computeOffsets();
    }
    return s.offset();
  },

  computeOffsets: function() {
    throw new Error('CompositeType abstract method call: computeOffsets');
  },

  fetch: function(name) {
    var s = this.get(name);
    if (s == null) {
      throw new Error("no such member in " + this.toString() + ": " + name);
    }
    return s;
  },

  get: function(name) {
    for (var s of this._members) {
      if (s.name() === name) {
        return s;
      }
    }
    return null;
  }
});

