var ast = require('../ast/index');
module.exports = ASTVisitor;

function ASTVisitor() {

};

ASTVisitor.prototype = {
  accept: function(node) {
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
    else if (node instanceof ast.BinaryOpNode) this.visitBinaryOpNode(node);
    else if (node instanceof ast.UnaryOpNode) this.visitUnaryOpNode(node);
    else if (node instanceof ast.PrefixOpNode) this.visitPrefixOpNode(node);
    else if (node instanceof ast.SuffixOpNode) this.visitSuffixOpNode(node);
    else if (node instanceof ast.ArefNode) this.visitArefNode(node);
    else if (node instanceof ast.MemberNode) this.visitMemberNode(node);
    else if (node instanceof ast.PtrMemberNode) this.visitPtrMemberNode(node);
    else if (node instanceof ast.FuncallNode) this.visitFuncallNode(node);
    else if (node instanceof ast.DereferenceNode) this.visitDereferenceNode(node);
    else if (node instanceof ast.AddressNode) this.visitAddressNode(node);
    else if (node instanceof ast.CastNode) this.visitCastNode(node);
    else if (node instanceof ast.SizeofExprNode) this.visitSizeofExprNode(node);
    else if (node instanceof ast.SizeofTypeNode) this.visitSizeofTypeNode(node);
    else if (node instanceof ast.VariableNode) this.visitVariableNode(node);
    else if (node instanceof ast.IntegerLiteralNode) this.visitIntegerLiteralNode(node);
    else if (node instanceof ast.StringLiteralNode) this.visitStringLiteralNode(node);
    else throw new Error('ASTVisitor node type error');
  },

  visitStmt(stmt) {
    stmt.accept(this);
  },

  visitStmts(stmts) {
    for (var s of stmts) {
      this.visitStmt(s);
    }
  },

  visitExpr(expr) {
    expr.accept(this);
  },

  visitExprs(exprs) {
    for (var e of exprs) {
      this.visitExpr(e);
    }
  },

  visitBlockNode: function(node) {
    for (var v of node.variables()) {
      if (v.hasInitializer()) {
        this.visitExpr(v.initializer());
      }
    }
    this.visitStmts(node.stmts());
    return null;
  },

  visitExprStmtNode: function(node) {
    this.visitExpr(node.expr());
    return null;
  },

  visitIfNode: function(n) {
    this.visitExpr(n.cond());
    visitStmt(n.thenBody());
    if (n.elseBody() != null) {
      this.visitStmt(n.elseBody());
    }
    return null;
  },

  visitSwitchNode: function(n) {
    this.visitExpr(n.cond());
    this.visitStmts(n.cases());
    return null;
  },

  visitCaseNode: function(n) {
    this.this.visitExprs(n.values());
    this.visitStmt(n.body());
    return null;
  },

  visitWhileNode: function(n) {
    this.visitExpr(n.cond());
    this.visitStmt(n.body());
    return null;
  },

  visitDoWhileNode: function(n) {
    this.visitStmt(n.body());
    this.visitExpr(n.cond());
    return null;
  },

  visitForNode: function(n) {
    this.visitStmt(n.init());
    this.visitExpr(n.cond());
    this.visitStmt(n.incr());
    this.visitStmt(n.body());
    return null;
  },

  visitBreakNode: function(n) {
    return null;
  },

  visitContinueNode: function(n) {
    return null;
  },

  visitGotoNode: function(n) {
    return null;
  },

  visitLabelNode: function(n) {
    this.visitStmt(n.stmt());
    return null;
  },

  visitReturnNode: function(n) {
    if (n.expr() != null) {
      this.visitExpr(n.expr());
    }
    return null;
  },

  //
  // Expressions
  //

  visitCondExprNode: function(n) {
    this.visitExpr(n.cond());
    this.visitExpr(n.thenExpr());
    if (n.elseExpr() != null) {
      this.visitExpr(n.elseExpr());
    }
    return null;
  },

  visitLogicalOrNode: function(node) {
    this.visitExpr(node.left());
    this.visitExpr(node.right());
    return null;
  },

  visitLogicalAndNode: function(node) {
    this.visitExpr(node.left());
    this.visitExpr(node.right());
    return null;
  },

  visitAssignNode: function(n) {
    this.visitExpr(n.lhs());
    this.visitExpr(n.rhs());
    return null;
  },

  visitOpAssignNode: function(n) {
    this.visitExpr(n.lhs());
    this.visitExpr(n.rhs());
    return null;
  },

  visitBinaryOpNode: function(n) {
    this.visitExpr(n.left());
    this.visitExpr(n.right());
    return null;
  },

  visitUnaryOpNode: function(node) {
    this.visitExpr(node.expr());
    return null;
  },

  visitPrefixOpNode: function(node) {
    this.visitExpr(node.expr());
    return null;
  },

  visitSuffixOpNode: function(node) {
    this.visitExpr(node.expr());
    return null;
  },

  visitFuncallNode: function(node) {
    this.visitExpr(node.expr());
    this.visitExprs(node.args());
    return null;
  },

  visitArefNode: function(node) {
    this.visitExpr(node.expr());
    this.visitExpr(node.index());
    return null;
  },

  visitMemberNode: function(node) {
    this.visitExpr(node.expr());
    return null;
  },

  visitPtrMemberNode: function(node) {
    this.visitExpr(node.expr());
    return null;
  },

  visitDereferenceNode: function(node) {
    this.visitExpr(node.expr());
    return null;
  },

  visitAddressNode: function(node) {
    this.visitExpr(node.expr());
    return null;
  },

  visitCastNode: function(node) {
    this.visitExpr(node.expr());
    return null;
  },

  visitSizeofExprNode: function(node) {
    this.visitExpr(node.expr());
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


