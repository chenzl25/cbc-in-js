var ast = require('../ast/index');
module.exports = ASTVisitor;

function ASTVisitor() {

};

ASTVisitor.errorMsg = 'ASTVisitor node type error';

ASTVisitor.prototype = {
  visit: function(node) {
    // NOTE: keep the subClass above the supClass.
    if (node instanceof ast.BlockNode) this.visitBlockNode(node);
    else if (node instanceof ast.ExprStmtNode) this.visitExprStmtNode(node);
    else if (node instanceof ast.IfNode) this.visitIfNode(node);
    else if (node instanceof ast.SwitchNode) this.visitSwitchNode(node);
    else if (node instanceof ast.CaseNode) this.visitCaseNode(node);
    else if (node instanceof ast.WhileNode) this.visitWhileNode(node);
    else if (node instanceof ast.DoWhileNode) this.visitDoWhileNode(node);
    else if (node instanceof ast.ForNode) this.visitForNode(node);
    else if (node instanceof ast.BreakNode) this.visitBreakNode(node);
    else if (node instanceof ast.ContinueNode) this.visitContinueNode(node);
    else if (node instanceof ast.GotoNode) this.visitGotoNode(node);
    else if (node instanceof ast.LabelNode) this.visitLabelNode(node);
    else if (node instanceof ast.ReturnNode) this.visitReturnNode(node);
    // Expressions
    else if (node instanceof ast.AssignNode) this.visitAssignNode(node);
    else if (node instanceof ast.OpAssignNode) this.visitOpAssignNode(node);
    else if (node instanceof ast.CondExprNode) this.visitCondExprNode(node);
    else if (node instanceof ast.LogicalOrNode) this.visitLogicalOrNode(node);
    else if (node instanceof ast.LogicalAndNode) this.visitLogicalAndNode(node);
    else if (node instanceof ast.PrefixOpNode) this.visitPrefixOpNode(node);
    else if (node instanceof ast.SuffixOpNode) this.visitSuffixOpNode(node);
    else if (node instanceof ast.ArefNode) this.visitArefNode(node);
    else if (node instanceof ast.MemberNode) this.visitMemberNode(node);
    else if (node instanceof ast.PtrMemberNode) this.visitPtrMemberNode(node);
    else if (node instanceof ast.FuncallNode) this.visitFuncallNode(node);
    else if (node instanceof ast.DereferenceNode) this.visitDereferenceNode(node);
    else if (node instanceof ast.AddressNode) this.visitAddressNode(node);
    else if (node instanceof ast.CastNode) this.visitCastNode(node);
    else if (node instanceof ast.UnaryOpNode) this.visitUnaryOpNode(node);
    else if (node instanceof ast.BinaryOpNode) this.visitBinaryOpNode(node);
    else if (node instanceof ast.SizeofExprNode) this.visitSizeofExprNode(node);
    else if (node instanceof ast.SizeofTypeNode) this.visitSizeofTypeNode(node);
    else if (node instanceof ast.VariableNode) this.visitVariableNode(node);
    else if (node instanceof ast.IntegerLiteralNode) this.visitIntegerLiteralNode(node);
    else if (node instanceof ast.StringLiteralNode) this.visitStringLiteralNode(node);
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
    this.visit(node.init());
    this.visit(node.cond());
    this.visit(node.incr());
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


