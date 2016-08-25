var ir = require('../../ir/index');
module.exports = IRVisitor;

function IRVisitor() {

};

IRVisitor.errorMsg = 'IRVisitor node type error';

IRVisitor.prototype = {
  visit: function(node) {
    if (node instanceof ir.ExprStmt) return this.visitExprStmt(node);
    else if (node instanceof ir.Assign) return this.visitAssign(node);
    else if (node instanceof ir.CJump) return this.visitCJump(node);
    else if (node instanceof ir.Jump) return this.visitJump(node);
    else if (node instanceof ir.Switch) return this.visitSwitch(node);
    else if (node instanceof ir.LabelStmt) return this.visitLabelStmt(node);
    else if (node instanceof ir.Return) return this.visitReturn(node);
    else if (node instanceof ir.Uni) return this.visitUni(node);
    else if (node instanceof ir.Bin) return this.visitBin(node);
    else if (node instanceof ir.Call) return this.visitCall(node);
    else if (node instanceof ir.Addr) return this.visitAddr(node);
    else if (node instanceof ir.Mem) return this.visitMem(node);
    else if (node instanceof ir.Var) return this.visitVar(node);
    else if (node instanceof ir.Case) return this.visitCast(node);
    else if (node instanceof ir.Int) return this.visitInt(node);
    else if (node instanceof ir.Str) return this.visitStr(node);
    else throw new Error(IRVisitor.errorMsg);
  },
  
  visitStmts(stmts) {
    for (var s of stmts) {
      this.visit(s);
    }
  },
  
  visitExprs(exprs) {
    for (var e of exprs) {
      this.visit(e);
    }
  },

  //
  // Stmt
  //

  visitExprStmt: function(node) {
    this.visit(node.expr());
  },

  visitAssign: function(node) {
    this.visit(node.lhs());
    this.visit(node.rhs());
  },

  visitCJump: function(node) {
    this.visit(node.cond());
  },

  visitJump: function(node) {

  },

  visitSwitch: function(node) {
    this.visit(node.cond());
  },

  visitLabelStmt: function(node) {

  },

  visitReturn: function(node) {
    if (node.expr()) {
      this.visit(node.expr());
    }
  },

  //
  // Expr
  //
  
  visitUni: function(node) {
    this.visit(node.expr());
  },

  visitBin: function(node) {
    this.visit(node.left());
    this.visit(node.right());
  },

  visitCall: function(node) {
    this.visit(node.expr());
    this.visitExprs(node.args());
  },

  visitAddr: function(node) {
    this.visit(node.expr());
  },

  visitMem: function(node) {
    this.visit(node.expr());
  },

  visitVar: function(node) {

  },

  visitCase: function(node) {

  },

  visitInt: function(node) {

  },

  visitStr: function(node) {

  }
}