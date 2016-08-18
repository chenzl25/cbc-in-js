var $extend = require('../util/extend');
var $import = require('../util/import');
var LiteralNode = require('./LiteralNode');
module.exports = StringLiteralNode;

$extend(StringLiteralNode, LiteralNode);
function StringLiteralNode(loc, ref, value) {
  // Location loc, TypeRef ref, String value
  StringLiteralNode.super.call(this, loc, ref);
  this._value = value;
};


$import(StringLiteralNode.prototype, {
  value: function() {
    return this._value;
  },

  entry: function() {
    return this._entry;
  },

  setEntry: function(ent) {
    // ConstantEntry ent
    this._entry = ent;
  }
  // accept: function(){}
});
