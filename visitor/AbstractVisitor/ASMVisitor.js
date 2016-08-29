var asm = require('../../asm/index');
module.exports = ASMVisitor;

function ASMVisitor() {

}

ASMVisitor.errorMsg = 'ASMVisitor node type error';

ASMVisitor.prototype = {
  visit: function(node) {
    if (node instanceof asm.Directive) return this.visitDirective(node);
    else if (node instanceof asm.Instruction) return this.visitInstruction(node);
    else if (node instanceof asm.Label) return this.visitLabel(node);
    else throw new Error(ASMVisitor.errorMsg);
  },

  visitDirective: function(node) {

  },

  visitInstruction: function(node) {

  },

  visitLabel: function(node) {

  }
};