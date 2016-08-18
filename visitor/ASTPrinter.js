var $extend = require('../util/extend');
var $import = require('../util/import');
var ASTVisitor = require('./ASTVisitor');
module.exports = ASTPrinter;

$extend(ASTPrinter, ASTVisitor);
function ASTPrinter() {
  this.str = "";
  this._indent = 0;
  this._indentSpace = 4;
}

$import(ASTPrinter.prototype, {
  print: function(ast) {
    this.tag('AST', ast.location());
    this.single('variables');
    this.in();
    this.printDefinedVariables(ast.definedVariables());
    this.out();
    this.single('functions');
    this.in();
    this.printDefinedFunctions(ast.definedFunctions());
    this.out();
    this.log();
  },

  printDefinedVariables: function(defvars, tag) {
    for (var v of defvars) {
      this.printDefinedVariable(v, tag);
    }
  },

  printDefinedVariable: function(defvar, tag) {
      this.tag(tag?tag:'DefinedVariable', defvar.location());
      this.pair('name', defvar.name());
      this.pair('isPrivate', defvar.isPrivate());
      this.pair('typeNode', defvar.typeNode())
      if (defvar.hasInitializer()) {
        this.single('initializer');
        this.in();
        this.visit(defvar.initializer());
        this.out();
      }
  },

  printDefinedFunctions: function(defuns) {
    for (var f of defuns) {
      this.printDefinedFunction(f);
    }
  },

  printDefinedFunction: function(defun) {
    this.tag('definedFunction', defun.location());
    this.pair('name', defun.name());
    this.pair('isPrivate', defun.isPrivate());
    this.pair('typeNode', defun.typeNode());
    this.single('params');
    this.in();
    this.printDefinedVariables(defun.parameters(), 'CBCParameter');
    this.out();
    this.single('body');
    this.in();
    this.visit(defun.body());
    this.out();
  },

  in: function() {
    this._indent += this._indentSpace;
  },

  out: function() {
    this._indent -= this._indentSpace;
  },

  indent: function() {
    for (var i = 0; i < this._indent; i++) {
      this.str += ' ';
    }
  },

  tag: function(name, location) {
    this.indent();
    this.str += '<<' + name + '>> (' + location.fileName() + ':' + location.line() + ')';
    this.str += '\n';
  },

  pair: function(first, second) {
    this.indent();
    this.str += first + ': ' + second;
    this.str += '\n';
  },

  single: function(first) {
    this.indent();
    this.str += first + ':';
    this.str += '\n';
  },

  log: function() {
    console.log(this.str);
  },

  /*================================
  =            override            =
  ================================*/
  
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
    this.tag('BlockNode', node.location());
    this.single('variables');
    this.in();
    this.printDefinedVariables(node.variables());
    this.out();
    this.single('stmts');
    this.in();
    this.visitStmts(node.stmts());
    this.out();
    return null;
  },

  visitExprStmtNode: function(node) {
    this.tag('ExprStmtNode', node.location());
    this.single('expr');
    this.in();
    this.visit(node.expr());
    this.out();
    return null;
  },

  visitIfNode: function(node) {
    this.tag('IfNode', node.location());
    this.single('cond');
    this.in();
    this.visit(node.cond());
    this.out();
    this.single('thenBody');
    this.in();
    this.visit(node.thenBody());
    this.out();
    if (node.elseBody() != null) {
      this.single('elseBody');
      this.in();
      this.visit(node.elseBody());
      this.out();
    } else {
      this.pair('elseBody', 'null');
    }
    return null;
  },

  visitSwitchNode: function(node) {
    this.tag('SwitchNode', node.location());
    this.single('cond');
    this.in();
    this.visit(node.cond());
    this.out();
    this.single('cases');
    this.in();
    this.visitStmts(node.cases());
    this.out();
    return null;
  },

  visitCaseNode: function(node) {
    this.tag('CaseNode', node.location());
    this.single('values');
    this.in();
    this.visitExprs(node.values());
    this.out();
    this.single('body');
    this.in();
    this.visit(node.body());
    this.out();
    return null;
  },

  visitWhileNode: function(node) {
    this.tag('WhileNode', node.location());
    this.single('cond');
    this.in();
    this.visit(node.cond());
    this.out();
    this.single('body');
    this.in();
    this.visit(node.body());
    this.out();
    return null;
  },

  visitDoWhileNode: function(node) {
    this.tag('DoWhileNode', node.location());
    this.single('body');
    this.in();
    this.visit(node.body());
    this.out();
    this.single('cond');
    this.in();
    this.visit(node.cond());
    this.out();
    return null;
  },

  visitForNode: function(node) {
    this.tag('ForNode', node.location());
    this.single('init');
    this.in();
    this.visit(node.init());
    this.out();
    this.single('cond');
    this.in();
    this.visit(node.cond());
    this.out();
    this.single('incr');
    this.in();
    this.visit(node.incr());
    this.out();
    this.single('body');
    this.in();
    this.visit(node.body());
    this.out();
    return null;
  },

  visitBreakNode: function(node) {
    this.tag('BreakNode', node.location());
    return null;
  },

  visitContinueNode: function(node) {
    this.tag('ContinueNode', node.location());
    return null;
  },

  visitGotoNode: function(node) {
    this.tag('GotoNode', node.location());
    this.pair('target', node.target());
    return null;
  },

  visitLabelNode: function(node) {
    this.tag('LabelNode', node.location());
    this.pair('name', node.name());
    this.single('stmt');
    this.in();
    this.visit(node.stmt());
    this.out();
    return null;
  },

  visitReturnNode: function(node) {
    this.tag('ReturnNode', node.location());
    if (node.expr() != null) {
      this.single('expr');
      this.in();
      this.visit(node.expr());
      this.out();
    } else {
      this.pair('expr', 'null');
    }
    return null;
  },

  //
  // Expressions
  //

  visitCondExprNode: function(node) {
    this.tag('CondExprNode', node.location());
    this.single('cond');
    this.in();
    this.visit(node.cond());
    this.out();
    this.single('thenExpr');
    this.in();
    this.visit(node.thenExpr());
    this.out();
    this.single('elseExpr');
    this.in();
    this.visit(node.elseExpr());
    this.out();
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
    this.tag('OpAssignNode', node.location()),
    this.single('lhs');
    this.in();
    this.visit(node.lhs());
    this.out();
    this.single('rhs');
    this.in();
    this.visit(node.rhs());
    this.out();
    return null;
  },

  visitBinaryOpNode: function(node) {
    this.tag('OpAssignNode', node.location()),
    this.pair('operator', node.operator());
    this.single('left');
    this.in();
    this.visit(node.left());
    this.out();
    this.single('right');
    this.in();
    this.visit(node.right());
    this.out();
    return null;
  },

  visitUnaryOpNode: function(node) {
    this.tag('UnaryOpNode', node.location());
    this.pair('operator', node.operator());
    this.single('expr');
    this.in();
    this.visit(node.expr());
    this.out();
    return null;
  },

  visitPrefixOpNode: function(node) {
    this.tag('PrefixOpNode', node.location());
    this.pair('operator', node.operator());
    this.single('expr');
    this.in();
    this.visit(node.expr());
    this.out();
    return null;
  },

  visitSuffixOpNode: function(node) {
    this.tag('SuffixOpNode', node.location());
    this.pair('operator', node.operator());
    this.single('expr');
    this.in();
    this.visit(node.expr());
    this.out();
    return null;
  },

  visitFuncallNode: function(node) {
    this.tag('FuncallNode', node.location());
    this.single('expr');
    this.in();
    this.visit(node.expr());
    this.out();
    this.single('args');
    this.in();
    this.visitExprs(node.args());
    this.out();
    return null;
  },

  visitArefNode: function(node) {
    this.tag('ArefNode', node.location());
    this.single('expr');
    this.in();
    this.visit(node.expr());
    this.out();
    this.single('expr');
    this.in();
    this.visit(node.index());
    this.out();
    return null;
  },

  visitMemberNode: function(node) {
    this.tag('MemberNode', node.location());
    this.single('expr');
    this.in();
    this.visit(node.expr());
    this.out();
    this.pair('member', node.member());
    return null;
  },

  visitPtrMemberNode: function(node) {
    this.tag('PtrMemberNode', node.location());
    this.single('expr');
    this.in();
    this.visit(node.expr());
    this.out();
    this.pair('member', node.member());
    return null;
  },

  visitDereferenceNode: function(node) {
    this.tag('DereferenceNode', node.location());
    this.single('expr');
    this.in();
    this.visit(node.expr());
    this.out();
    return null;
  },

  visitAddressNode: function(node) {
    this.tag('AddressNode', node.location());
    this.single('expr');
    this.in();
    this.visit(node.expr());
    this.out();
    return null;
  },

  visitCastNode: function(node) {
    this.tag('CastNode', node.location());
    this.pair('typeNode', node.typeNode().typeRef());
    this.single('expr');
    this.in();
    this.visit(node.expr());
    this.out();
    return null;
  },

  visitSizeofExprNode: function(node) {
    this.tag('SizeofExprNode', node.location());
    this.single('expr');
    this.in();
    this.visit(node.expr());
    this.out();
    return null;
  },

  visitSizeofTypeNode: function(node) {
    this.tag('SizeofTypeNode', node.location());
    this.pair('operand', node.operandTypeNode());
    return null;
  },

  visitVariableNode: function(node) {
    this.tag('VariableNode', node.location());
    this.pair('name', node.name());
    return null;
  },

  visitIntegerLiteralNode: function(node) {
    this.tag('IntegerLiteralNode', node.location());
    this.pair('typeNode', node.typeNode().typeRef());
    this.pair('value', node.value());
    return null;
  },

  visitStringLiteralNode: function(node) {
    this.tag('StringLiteralNode', node.location());
    this.pair('value', node.value());
    return null;
  }
});
