var ast = require('../../ast/index');
module.exports = ASTVisitor;

function ASTVisitor() {

};

ASTVisitor.errorMsg = 'ASTVisitor node type error';

ASTVisitor.prototype = {
  visit: function(node) {
    // NOTE: keep the subClass above the supClass.
    if (node instanceof ast.BlockNode) return this.visitBlockNode(node);
    else if (node instanceof ast.ExprStmtNode) return this.visitExprStmtNode(node);
    else if (node instanceof ast.IfNode) return this.visitIfNode(node);
    else if (node instanceof ast.SwitchNode) return this.visitSwitchNode(node);
    else if (node instanceof ast.CaseNode) return this.visitCaseNode(node);
    else if (node instanceof ast.WhileNode) return this.visitWhileNode(node);
    else if (node instanceof ast.DoWhileNode) return this.visitDoWhileNode(node);
    else if (node instanceof ast.ForNode) return this.visitForNode(node);
    else if (node instanceof ast.BreakNode) return this.visitBreakNode(node);
    else if (node instanceof ast.ContinueNode) return this.visitContinueNode(node);
    else if (node instanceof ast.GotoNode) return this.visitGotoNode(node);
    else if (node instanceof ast.LabelNode) return this.visitLabelNode(node);
    else if (node instanceof ast.ReturnNode) return this.visitReturnNode(node);
    // Expressions
    else if (node instanceof ast.AssignNode) return this.visitAssignNode(node);
    else if (node instanceof ast.OpAssignNode) return this.visitOpAssignNode(node);
    else if (node instanceof ast.CondExprNode) return this.visitCondExprNode(node);
    else if (node instanceof ast.LogicalOrNode) return this.visitLogicalOrNode(node);
    else if (node instanceof ast.LogicalAndNode) return this.visitLogicalAndNode(node);
    else if (node instanceof ast.PrefixOpNode) return this.visitPrefixOpNode(node);
    else if (node instanceof ast.SuffixOpNode) return this.visitSuffixOpNode(node);
    else if (node instanceof ast.ArefNode) return this.visitArefNode(node);
    else if (node instanceof ast.MemberNode) return this.visitMemberNode(node);
    else if (node instanceof ast.PtrMemberNode) return this.visitPtrMemberNode(node);
    else if (node instanceof ast.FuncallNode) return this.visitFuncallNode(node);
    else if (node instanceof ast.DereferenceNode) return this.visitDereferenceNode(node);
    else if (node instanceof ast.AddressNode) return this.visitAddressNode(node);
    else if (node instanceof ast.CastNode) return this.visitCastNode(node);
    else if (node instanceof ast.UnaryOpNode) return this.visitUnaryOpNode(node);
    else if (node instanceof ast.BinaryOpNode) return this.visitBinaryOpNode(node);
    else if (node instanceof ast.SizeofExprNode) return this.visitSizeofExprNode(node);
    else if (node instanceof ast.SizeofTypeNode) return this.visitSizeofTypeNode(node);
    else if (node instanceof ast.VariableNode) return this.visitVariableNode(node);
    else if (node instanceof ast.IntegerLiteralNode) return this.visitIntegerLiteralNode(node);
    else if (node instanceof ast.StringLiteralNode) return this.visitStringLiteralNode(node);
    else throw new Error(ASTVisitor.errorMsg);
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

  visitBlockNode: function(node) {
    for (var v of node.variables()) {
      if (v.hasInitializer()) {
        this.visit(v.initializer());
      }
    }
    this.visitStmts(node.stmts());
    return null;
  },

  visitExprStmtNode: function(node) {
    this.visit(node.expr());
    return null;
  },

  visitIfNode: function(node) {
    this.visit(node.cond());
    this.visit(node.thenBody());
    if (node.elseBody() != null) {
      this.visit(node.elseBody());
    }
    return null;
  },

  visitSwitchNode: function(node) {
    this.visit(node.cond());
    this.visitStmts(node.cases());
    return null;
  },

  visitCaseNode: function(node) {
    this.visitExprs(node.values());
    this.visit(node.body());
    return null;
  },

  visitWhileNode: function(node) {
    this.visit(node.cond());
    this.visit(node.body());
    return null;
  },

  visitDoWhileNode: function(node) {
    this.visit(node.body());
    this.visit(node.cond());
    return null;
  },

  visitForNode: function(node) {
    if (node.init() != undefined) this.visit(node.init());
    if (node.cond() != undefined) this.visit(node.cond());
    if (node.incr() != undefined) this.visit(node.incr());
    this.visit(node.body());
    return null;
  },

  visitBreakNode: function(node) {
    return null;
  },

  visitContinueNode: function(node) {
    return null;
  },

  visitGotoNode: function(node) {
    return null;
  },

  visitLabelNode: function(node) {
    this.visit(node.stmt());
    return null;
  },

  visitReturnNode: function(node) {
    if (node.expr() != null) {
      this.visit(node.expr());
    }
    return null;
  },

  //
  // Expressions
  //

  visitCondExprNode: function(node) {
    this.visit(node.cond());
    this.visit(node.thenExpr());
    this.visit(node.elseExpr());
    return null;
  },

  visitLogicalOrNode: function(node) {
    this.visit(node.left());
    this.visit(node.right());
    return null;
  },

  visitLogicalAndNode: function(node) {
    this.visit(node.left());
    this.visit(node.right());
    return null;
  },

  visitAssignNode: function(node) {
    this.visit(node.lhs());
    this.visit(node.rhs());
    return null;
  },

  visitOpAssignNode: function(node) {
    this.visit(node.lhs());
    this.visit(node.rhs());
    return null;
  },

  visitBinaryOpNode: function(node) {
    this.visit(node.left());
    this.visit(node.right());
    return null;
  },

  visitUnaryOpNode: function(node) {
    this.visit(node.expr());
    return null;
  },

  visitPrefixOpNode: function(node) {
    this.visit(node.expr());
    return null;
  },

  visitSuffixOpNode: function(node) {
    this.visit(node.expr());
    return null;
  },

  visitFuncallNode: function(node) {
    this.visit(node.expr());
    this.visitExprs(node.args());
    return null;
  },

  visitArefNode: function(node) {
    this.visit(node.expr());
    this.visit(node.index());
    return null;
  },

  visitMemberNode: function(node) {
    this.visit(node.expr());
    return null;
  },

  visitPtrMemberNode: function(node) {
    this.visit(node.expr());
    return null;
  },

  visitDereferenceNode: function(node) {
    this.visit(node.expr());
    return null;
  },

  visitAddressNode: function(node) {
    this.visit(node.expr());
    return null;
  },

  visitCastNode: function(node) {
    this.visit(node.expr());
    return null;
  },

  visitSizeofExprNode: function(node) {
    this.visit(node.expr());
    return null;
  },

  visitSizeofTypeNode: function(node) {
    return null;
  },

  visitVariableNode: function(node) {
    return null;
  },

  visitIntegerLiteralNode: function(node) {
    return null;
  },

  visitStringLiteralNode: function(node) {
    return null;
  }
}


