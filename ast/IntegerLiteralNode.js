var $extend = require('../util/extend');
var $import = require('../util/import');
var LiteralNode = require('./LiteralNode');
var TypeNode = require('../ast/TypeNode');
module.exports = IntegerLiteralNode;

$extend(IntegerLiteralNode, LiteralNode);
function IntegerLiteralNode(loc, ref, value) {
  // Location loc, TypeRef ref, Number value
  IntegerLiteralNode.super.call(this, loc, ref);
  this._value = value;
};

$import(IntegerLiteralNode.prototype, {
  value: function() {
    return this._value;
  }
});

