var StructNode = require('../ast/StructNode');
var UnionNode = require('../ast/UnionNode');
var TypedefNode = require('../ast/TypedefNode');
module.exports = DeclarationVisitor;

function DeclarationVisitor() {
  
};

DeclarationVisitor.errorMsg = 'DeclarationVisitor node type error';

DeclarationVisitor.prototype = {
  visit: function(node) {
    if (node instanceof StructNode) this.visitStructNode(node);
    else if (node instanceof UnionNode) this.visitUnionNode(node);
    else if (node instanceof TypedefNode) this.visitTypedefNode(node);
    else throw new Error(DeclarationVisitor.errorMsg);
  },

  visitStructNode: function(struct) {

  },

  visitUnionNode: function(union) {

  },

  visitTypedefNode: function(typedef) {

  }
}