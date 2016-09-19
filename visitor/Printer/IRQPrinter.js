var $extend = require('../../util/extend');
var $import = require('../../util/import');
var IRVisitor = require('../AbstractVisitor/IRVisitor');
var ir = require('../../ir/index');
var Func = require('../../entity/Func');
module.exports = IRQPrinter;

$extend(IRQPrinter, IRVisitor);
function IRQPrinter() {
  this.str = "";
  this._indent = 0;
  this._indentSpace = 4;
}

$import(IRQPrinter.prototype, {
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
        this.pair('initializer', this.visit(ir));
      }
  },

  printVariables: function(vars) {
    for (var v of vars) {
      this.printVariable(v);
    }
  },

  printVariable: function(v) {
    this.pair(v.typeNode(), v.name());
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
    this.in();
    this.printVariables(defun.localVariables());
    this.out();
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

  q: function(op, a, b, c) {
    this.indent();
    this.str += op + ' ';
    if (a) this.str += a + ' ';
    if (b) this.str += b + ' ';
    if (c) this.str += c + ' ';
    this.str += '\n';
  },

  log: function() {
    console.log(this.str);
  },

  /*================================
  =            override            =
  ================================*/
  
  visitExprStmt: function(node) {
    throw new Error('impossible case')
  },

  visitAssign: function(node) {
    // nothing
    throw new Error('impossible case');
  },

  visitCJump: function(node) {
    this.q('cjump', this.visit(node.cond()), node.thenLabel(), node.elseLabel())
  },

  visitJump: function(node) {
    this.q('jump', node.label());
  },

  visitSwitch: function(node) {
    this.q('switch', this.visit(node.cond()));
    this.in();
    this.visitExprs(node.cases());
    this.pair('defaultLabel', node.defaultLabel());
    this.pair('endLabel', node.endLabel());
    this.out();
  },

  visitLabelStmt: function(node) {
    this.out();
    this.q(node.label() + ':');
    this.in();
  },

  visitReturn: function(node) {
    this.q('return ', node.expr() == null?'':this.visit(node.expr()));
  },

  //
  // Expr
  //
  
  visitUni: function(node) {
    return ir.Op.antiInternUnary(node.op()) + ' ' + this.visit(node.expr());
  },

  visitBin: function(node) {
    return this.visit(node.left()) + ' ' + ir.Op.antiInternBinary(node.op()) + ' ' + this.visit(node.right());
  },

  visitCall: function(node) {
    var sep = ''
    var result = 'call ' + this.visit(node.expr());
    result += '(';
    for (var arg of node.args()) {
      result += sep;
      sep = ', '
      result += this.visit(arg);
    }
    result += ')';
    return result;
  },

  visitAddr: function(node) {
    if (node.entity() instanceof Func) {
      return node.entity().name();
    }
    return '&' + node.entity().name();
  },

  visitMem: function(node) {
    return '[' +  this.visit(node.expr()) + ']';
  },

  visitVar: function(node) {
    return node.name();
  },

  visitCase: function(node) {
    this.q('value ', node.value()+': ', node.label());
  },

  visitInt: function(node) {
    return node.value().toString();
  },

  visitStr: function(node) {
    return node.entry().value();
  },

  visitMove: function(node) {
    this.q(this.visit(node.to()), ' <- ', this.visit(node.from()))
    // this.q('move', this.visit(node.from()), this.visit(node.to()));
  },

  visitLoad: function(node) {
    this.q('load', this.visit(node.to()), this.visit(node.from()));
  },

  visitStore: function(node) {
    this.q('store', this.visit(node.from()), this.visit(node.to()));
  },

  visitReg: function(node) {
    return node.name();
  }
});
