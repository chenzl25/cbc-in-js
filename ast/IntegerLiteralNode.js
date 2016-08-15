var $extend = require('../util/extend');
var $import = require('../util/import');
var LiteralNode = require('./LiteralNode');
var TypeNode = require('../ast/TypeNode');
module.exports = IntegerLiteralNode;

$extend(IntegerLiteralNode, LiteralNode);
function IntegerLiteralNode(loc, ref, value) {
  this.super(value);
  this.value;
};

$import(IntegerLiteralNode.prototype, {
  value: function() {
    return this.value;
  },

  // accept: function(){}
});

