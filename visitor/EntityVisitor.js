var entity = require('../entity/index');
module.exports = EntityVisitor;

function EntityVisitor() {
  
};

EntityVisitor.errorMsg = 'EntityVisitor node type error';

EntityVisitor.prototype = {
  visit: function(ent) {
    if (ent instanceof entity.DefinedVariable) this.visitDefinedVariable(ent);
    else if (ent instanceof entity.UndefinedVariable) this.visitUndefinedVariable(ent);
    else if (ent instanceof entity.DefinedFunction) this.visitDefinedFunction(ent);
    else if (ent instanceof entity.UndefinedFunction) this.visitUndefinedFunction(ent);
    else if (ent instanceof entity.Constant) this.visitConstant(ent);
    else throw new Error(EntityVisitor.errorMsg);
  },

  visitDefinedVariable: function(v) {
    
  },

  visitUndefinedVariable: function(v) {

  },

  visitDefinedFunction: function(func) {

  },

  visitUndefinedFunction: function(func) {

  },

  visitConstant: function(c) {

  }
}