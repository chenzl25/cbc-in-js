var $extend = require('../util/extend');
var $import = require('../util/import');
var LiteralNode = require('./LiteralNode');
module.exports = StringLiteralNode;

$extend(StringLiteralNode, LiteralNode);
function StringLiteralNode(loc, ref, value) {
  // Location loc, TypeRef ref, String value
  this.super(loc, ref);
  this.value = value;
};


$import(StringLiteralNode.prototype, {
  value: function() {
    return this.value;
  },

  entry: function() {
    return this.entry;
  },

  setEntry: function(ent) {
    // ConstantEntry ent
    this.entry = ent;
  }
  // accept: function(){}
});
