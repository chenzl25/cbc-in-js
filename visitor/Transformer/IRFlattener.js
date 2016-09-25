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
  visit: function(node, tmpInBin, tmpInUni) {
    if (tmpInBin !== true) tmpInBin = false;
    if (tmpInUni !== true) tmpInUni = false;
    if (node instanceof ir.ExprStmt) return this.visitExprStmt(node, tmpInBin, tmpInUni);
    else if (node instanceof ir.Assign) return this.visitAssign(node, tmpInBin, tmpInUni);
    else if (node instanceof ir.CJump) return this.visitCJump(node, tmpInBin, tmpInUni);
    else if (node instanceof ir.Jump) return this.visitJump(node, tmpInBin, tmpInUni);
    else if (node instanceof ir.Switch) return this.visitSwitch(node, tmpInBin, tmpInUni);
    else if (node instanceof ir.LabelStmt) return this.visitLabelStmt(node, tmpInBin, tmpInUni);
    else if (node instanceof ir.Return) return this.visitReturn(node, tmpInBin, tmpInUni);
    else if (node instanceof ir.Uni) return this.visitUni(node, tmpInBin, tmpInUni);
    else if (node instanceof ir.Bin) return this.visitBin(node, tmpInBin, tmpInUni);
    else if (node instanceof ir.Call) return this.visitCall(node, tmpInBin, tmpInUni);
    else if (node instanceof ir.Addr) return this.visitAddr(node, tmpInBin, tmpInUni);
    else if (node instanceof ir.Mem) return this.visitMem(node, tmpInBin, tmpInUni);
    else if (node instanceof ir.Var) return this.visitVar(node, tmpInBin, tmpInUni);
    else if (node instanceof ir.Case) return this.visitCase(node, tmpInBin, tmpInUni);
    else if (node instanceof ir.Int) return this.visitInt(node, tmpInBin, tmpInUni);
    else if (node instanceof ir.Str) return this.visitStr(node, tmpInBin, tmpInUni);
    else if (node instanceof ir.Move) return this.visitMove(node, tmpInBin, tmpInUni);
    else if (node instanceof ir.Load) return this.visitLoad(node, tmpInBin, tmpInUni);
    else if (node instanceof ir.Store) return this.visitStore(node, tmpInBin, tmpInUni);
    else if (node instanceof ir.Reg) return this.visitReg(node, tmpInBin, tmpInUni);
    else throw new Error(IRVisitor.errorMsg);
  },

  visitExprStmt: function(node) {
    this.visit(node.expr());
  },

  visitAssign: function(node) {
    // NOTICE: regR can be Int rather than Reg
    var regR = this.visit(node.rhs());
    var regL = this.visit(node.lhs()); // regL can be Mem
    this._stmts.push(new ir.Move(node.location(), regR, regL));
  },

  visitCJump: function(node) {
    node._cond = this.visit(node.cond(), true);
    this._stmts.push(node);
  },

  visitJump: function(node) {
    this._stmts.push(node);
  },

  visitSwitch: function(node) {
    node._cond = this.visit(node.cond(), true);
    this.visitExprs(node.cases());
    this._stmts.push(node);
  },

  visitLabelStmt: function(node) {
    this._stmts.push(node);
  },

  visitReturn: function(node) {
    if (node.expr()) {
      var tmp = this.visit(node.expr(), true);
      node._expr = tmp;
    }
    this._stmts.push(node);
  },

  //
  // Expr
  //
  
  visitUni: function(node, tmpInBin, tmpInUni) {
    if (tmpInUni) {
      node._expr = this.visit(node.expr(), tmpInBin, tmpInUni);
      var tmp  = ir.Reg.tmp();
      this._stmts.push(new ir.Move(null, node, tmp));
      return tmp;
    } else {
      node._expr = this.visit(node.expr(), tmpInBin, true);
      return node;      
    }
  },

  visitBin: function(node, tmpInBin) {
    if (tmpInBin) {
      node._left = this.visit(node.left(), true);
      node._right = this.visit(node.right(), true);
      var tmp  = ir.Reg.tmp();
      this._stmts.push(new ir.Move(null, node, tmp));
      return tmp;
    } else {
      node._left = this.visit(node.left(), true);
      node._right = this.visit(node.right(), true);
      return node;
    }
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
    // TODO change expr() to entity()
    // node._entity = this.visit(node.entity());
    // TODO: add node._entity info to Reg
    return node;
  },

  visitMem: function(node) {
    node._expr = this.visit(node.expr(), true);// trick
    // TODO: add node_expr info to Reg
    return node;
  },

  visitVar: function(node) {
    var tmp = new ir.Reg(node.name());
    // TODO: add Var info to Reg
    return tmp
  },

  visitCase: function(node) {
    // never 
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
