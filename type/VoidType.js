var $extend = require('../util/extend');
var $import = require('../util/import');
var Type = require('./Type');
module.exports = VoidType;

$extend(VoidType, Type);
function VoidType() {

};

$import(VoidType.prototype, {
  isVoid: function() {
    return true;
  },

  size: function() {
    return 1;
  },

  equals: function(other) {
    return (other instanceof VoidType);
  },

  isSameType: function(other) {
    return other.isVoid();
  },

  isCompatible: function(other) {
    return other.isVoid();
  },

  isCastableTo: function(other) {
    return other.isVoid();
  },

  toString: function() {
    return 'void';
  }
});
