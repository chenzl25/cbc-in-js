var $extend = require('../../util/extend');
var $import = require('../../util/import');
var IRVisitor = require('../AbstractVisitor/IRVisitor');
var ir = require('../../ir/index');
var asm = require('../../asm/index');
module.exports = IRFlattener;

$extend(IRFlattener, IRVisitor);
function IRFlattener(typeTable) {
  this._typeTable = typeTable;
  this._stmts = [];
}

$import(IRFlattener.prototype, {
  flatten: function(ir) {
    this.flattenDefinedFunctions(ir.definedFunctions());
  },

  flattenDefinedFunctions: function(defuns) {
    for (var f of defuns) {
      this.flattenDefinedFunction(f);
    }
  },

  flattenDefinedFunction: function(defun) {
    this._stmts = [];
    this.visitStmts(defun.ir());
    defun._ir = this._stmts;
  },

  /*================================
  =            override            =
  ================================*/
  
  visitExprStmt: function(node) {
    this.visit(node.expr());
  },

  visitAssign: function(node) {
    // NOTICE: regR can be Int rather than Reg
    var regR = this.visit(node.rhs());
    var regL = this.visit(node.lhs());
    this._stmts.push(new ir.Store(node.location(), regR, regL));
  },

  visitCJump: function(node) {
    node._cond = this.visit(node.cond());
    this._stmts.push(node);
  },

  visitJump: function(node) {
    this._stmts.push(node);
  },

  visitSwitch: function(node) {
    node._cond = this.visit(node.cond());
    this.visitExprs(node.cases());
    this._stmts.push(node);
  },

  visitLabelStmt: function(node) {
    this._stmts.push(node);
  },

  visitReturn: function(node) {
    var tmp = this.visit(node.expr());
    node._expr = tmp;
    this._stmts.push(node);
  },

  //
  // Expr
  //
  
  visitUni: function(node) {
    node._expr = this.visit(node.expr());
    var tmp  = ir.Reg.tmp();
    this._stmts.push(new ir.Move(null, node, tmp));
    return tmp;
  },

  visitBin: function(node) {
    node._left = this.visit(node.left());
    node._right = this.visit(node.right());
    var tmp  = ir.Reg.tmp();
    this._stmts.push(new ir.Move(null, node, tmp));
    return tmp;
  },

  visitCall: function(node) {
    if (node.isStaticCall()) {

    } else {
      node._expr = this.visit(node.expr());
      
    }
    var regs = [];
    var args = node.args();
    for (var arg of args) {
      var t = this.visit(arg);
      regs.push(t);
    }
    node._args = regs;
    var tmp  = ir.Reg.tmp();
    this._stmts.push(new ir.Move(null, node, tmp));
    return tmp;
  },

  visitAddr: function(node) {
    var tmp  = ir.Reg.tmp();
    this._stmts.push(new ir.Move(null, node, tmp));
    return tmp;
  },

  visitMem: function(node) {
    node._expr = this.visit(node.expr());
    var tmp  = ir.Reg.tmp();
    this._stmts.push(new ir.Move(null, node, tmp));
    return tmp;
  },

  visitVar: function(node) {
    var tmp = ir.Reg.tmp();
    var addr = node.addressNode(this.ptr_t());
    this._stmts.push(new ir.Load(null, tmp , addr));
    return tmp
  },

  visitCase: function(node) {
    // todo
  },

  visitInt: function(node) {
    return node;
  },

  visitStr: function(node) {
    return node;
  },

  ptr_t: function() {
    return asm.Type.get(this._typeTable.pointerSize());
  },
});
