var $extend = require('../../util/extend');
var $import = require('../../util/import');
var IRVisitor = require('../AbstractVisitor/IRVisitor');
module.exports = IRPrinter;

$extend(IRPrinter, IRVisitor);
function IRPrinter() {
  this.str = "";
  this._indent = 0;
  this._indentSpace = 4;
}

$import(IRPrinter.prototype, {
  print: function(ir) {
    this.tag('IR', ir.location());
    this.single('variables');
    this.in();
    this.printDefinedVariables(ir.definedVariables());
    this.out();
    this.single('functions');
    this.in();
    this.printDefinedFunctions(ir.definedFunctions());
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
      this.pair('type', defvar.typeNode())
      var ir = defvar.ir()
      if (ir) {
        this.single('initializer');
        this.in();
        this.visit(ir);
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
    this.pair('type', defun.typeNode());
    this.single('body');
    this.in();
    this.visitStmts(defun.ir());
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
    this.str += '<<' + name + '>>';
    if (location) {
      this.str += ' (' + location.fileName() + ':' + location.line() + ')';
    }
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
  
  visitExprStmt: function(node) {
    this.tag('ExprStmt', node.location());
    this.single('expr');
    this.in();
    this.visit(node.expr());
    this.out();
  },

  visitAssign: function(node) {
    this.tag('Assign', node.location());
    this.single('lhs');
    this.in();
    this.visit(node.lhs());
    this.out();
    this.single('rhs');
    this.in();
    this.visit(node.rhs());
    this.out();
  },

  visitCJump: function(node) {
    this.tag('CJump', node.location());
    this.single('cond');
    this.in();
    this.visit(node.cond());
    this.out();
    this.pair('thenLabel', node.thenLabel());
    this.pair('elseLabel', node.elseLabel());
  },

  visitJump: function(node) {
    this.tag('Jump', node.location());
    this.pair('label', node.label());
  },

  visitSwitch: function(node) {
    this.tag('Switch', node.location());
    this.single('cond');
    this.in();
    this.visit(node.cond());
    this.out();
    this.single('cases');
    this.in();
    this.visitExprs(node.cases());
    this.out();
    this.pair('defaultLabel', node.defaultLabel());
    this.pair('endLabel', node.endLabel());
  },

  visitLabelStmt: function(node) {
    this.tag('LabelStmt', node.location());
    this.pair('label', node.label());
  },

  visitReturn: function(node) {
    this.tag('Return', node.location());
    this.single('expr');
    this.in();
    this.visit(node.expr());
    this.out();
  },

  //
  // Expr
  //
  
  visitUni: function(node) {
    this.tag('Uni');
    this.pair('type', node.type());
    this.pair('op', node.op());
    this.in();
    this.visit(node.expr());
    this.out();
  },

  visitBin: function(node) {
    this.tag('Bin');
    this.pair('type', node.type());
    this.pair('op', node.op());
    this.single('left');
    this.in();
    this.visit(node.left());
    this.out();
    this.single('right');
    this.in();
    this.visit(node.right());
    this.out();
  },

  visitCall: function(node) {
    this.tag('Call');
    this.pair('type', node.type());
    this.single('expr');
    this.in();
    this.visit(node.expr());
    this.out();
    this.single('args');
    this.in();
    this.visitExprs(node.args());
    this.out();
  },

  visitAddr: function(node) {
    this.tag('Addr');
    this.pair('type', node.type());
    this.pair('entity', node.entity().name());
  },

  visitMem: function(node) {
    this.tag('Mem');
    this.pair('type', node.type());
    this.single('expr');
    this.in();
    this.visit(node.expr());
    this.out();
  },

  visitVar: function(node) {
    this.tag('Var');
    this.pair('type', node.type());
    this.pair('entity', node.entity().name());
  },

  visitCase: function(node) {
    this.tag('Case');
    this.pair('value', node.value());
    this.pair('label', node.label());
  },

  visitInt: function(node) {
    this.tag('Int');
    this.pair('type', node.type());
    this.pair('value', node.value());
  },

  visitStr: function(node) {
    this.tag('Str');
    this.pair('type', node.type());
    this.pair('entity-string', node.entry().value());
  },
});
