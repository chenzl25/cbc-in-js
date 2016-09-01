var $extend = require('../../util/extend');
var $import = require('../../util/import');
var ASTVisitor = require('../AbstractVisitor/ASTVisitor');
var ErrorHandler = require('../../util/ErrorHandler');
var ir = require('../../ir/index');
var Label = require('../../asm/Label');
var asm = require('../../asm/index');
module.exports = IRGenerator;

$extend(IRGenerator, ASTVisitor);
function IRGenerator(typeTable) {
  this._typeTable = typeTable; // TypeTable
  this._stmts;                 // Stmt[]
  this._scopeStack;            // LocalScope[]
  this._breakStack;            // Label[]
  this._continueStack;         // Label[]
  this._jumpMap;               // String -> JumpEntry
  this._exprNestLevel = 0;     // Number
}

$import(IRGenerator.prototype, {
  generate: function(ast) {
    for (var v of ast.definedVariables()) {
        if (v.hasInitializer()) {
            v.setIR(this.transformExpr(v.initializer()));
        }
    }
    for (var f of ast.definedFunctions()) {
        f.setIR(this.compileFunctionBody(f));
    }
    return ast.ir();
  },

  //
  // Definitions
  //

  /**
   * @param  {Object} f // DefinedFunction
   * @return {Array}    // Stmt[]
   */
  
  compileFunctionBody: function(f) {
    this._stmts = [];
    this._scopeStack = [];
    this._breakStack = [];
    this._continueStack = [];
    this._jumpMap = new Map();
    this.visit(f.body());
    this.checkJumpLinks(this._jumpMap);
    return this._stmts;
  },



  /**
   * @param  {Object} node // ExprNode
   * @return {Object}      // Expr
   */

  transformExpr: function(node) {
    // ExprNode 
    this._exprNestLevel++;
    var e = this.visit(node);
    this._exprNestLevel--;
    return e;
  },

  isStatement: function() {
    return this._exprNestLevel === 0;
  },

  assign: function(loc, lhs, rhs) {
    // Location loc, Expr lhs, Expr rhs
    this._stmts.push(new ir.Assign(loc, lhs, rhs));
  },

  /**
   * @param  {Object} t // Type
   * @return {Object}   // DefinedVariable
   */
  
  tmpVar: function(t) {
    return this._scopeStack[this._scopeStack.length-1].allocateTmp(t);
  },

  label: function(label) {
    this._stmts.push(new ir.LabelStmt(null, label));
  },

  jump: function(loc, target) {
    if (loc instanceof Label) {
      target = loc;
      this._stmts.push(new ir.Jump(null, target));
    } else {
      this._stmts.push(new ir.Jump(loc, target));
    }
  },

  cjump: function(loc, cond, thenLabel, elseLabel) {
    // Location loc, Expr cond, Label thenLabel, Label elseLabel
    this._stmts.push(new ir.CJump(loc, cond, thenLabel, elseLabel));
  },

  pushBreak: function(label) {
    this._breakStack.push(label);
  },

  popBreak: function() {
    if (this._breakStack.length === 0) {
      throw new Error("unmatched push/pop for break stack");
    }
    this._breakStack.pop();
  },

  currentBreakTarget: function() {
    if (this._breakStack.length === 0) {
      throw new Error("break from out of loop");
    }
    return this._breakStack[this._breakStack.length-1];
  },

  pushContinue: function(label) {
    this._continueStack.push(label);
  },

  popContinue: function() {
    if (this._continueStack.length === 0) {
      throw new Error("unmatched push/pop for continue stack");
    }
    this._continueStack.pop();
  },

  currentContinueTarget: function() {
    if (this._continueStack.length === 0) {
      throw new Error("continue from out of loop");
    }
    return this._continueStack[this._continueStack.length-1];
  },
  
  //
  // Statements
  //

  visitBlockNode: function(node) {
    this._scopeStack.push(node.scope());
    for (var v of node.variables()) {
      if (v.hasInitializer()) {
        if (v.isPrivate()) {
          v.setIR(this.transformExpr(v.initializer()));
        } else {
          this.assign(v.location(), this.ref(v), 
                      this.transformExpr(v.initializer()));
        }
      }
    }
    this.visitStmts(node.stmts());
    this._scopeStack.pop();
    return null;
  },

  visitExprStmtNode: function(node) {
    var e = this.visit(node.expr());
    if (e != null) {
      this.warn(node.location(), "useless expression");
    }
    return null;
  },

  visitIfNode: function(node) {
    var thenLabel = new Label();
    var elseLabel = new Label();
    var endLabel  = new Label();
    var cond = this.transformExpr(node.cond());
    if (node.elseBody() == null) {
      this.cjump(node.location(), cond, thenLabel, endLabel);
      this.label(thenLabel);
      this.visit(node.thenBody());
      this.label(endLabel);
    } else {
      this.cjump(node.location(), cond, thenLabel, elseLabel);
      this.label(thenLabel);
      this.visit(node.thenBody());
      this.jump(endLabel);
      this.label(elseLabel);
      this.visit(node.elseBody());
      this.label(endLabel);
    }
    return null;
  },

  visitSwitchNode: function(node) {
    var cases = []; // Case[]
    var endLabel = new Label();
    var defaultLabel = endLabel;

    var cond = this.transformExpr(node.cond());
    for (var c of node.cases()) {
      if (c.isDefault()) {
        defaultLabel = c.label();
      } else {
        for (var val of c.values()) {
          var v = this.transformExpr(val);
          cases.push(new ir.Case(/*Number*/v.value(), c.label()));
        }
      }
    }
    this._stmts.push(new ir.Switch(node.location(), cond, cases, defaultLabel, endLabel));
    this.pushBreak(endLabel);
    for (var c of node.cases()) {
      this.label(c.label());
      this.visit(c.body());
    }
    this.popBreak();
    this.label(endLabel);
    return null;
  },

  visitCaseNode: function(node) {
    throw new Error("must not happen");
  },

  visitWhileNode: function(node) {
    var begLabel = new Label();
    var bodyLabel = new Label();
    var endLabel = new Label();

    this.label(begLabel);
    this.cjump(node.location(), this.transformExpr(node.cond()), bodyLabel, endLabel);
    this.label(bodyLabel);
    this.pushContinue(begLabel);
    this.pushBreak(endLabel);
    this.visit(node.body());
    this.popBreak();
    this.popContinue();
    this.jump(begLabel);
    this.label(endLabel);
    return null;
  },

  visitDoWhileNode: function(node) {
    var begLabel = new Label();
    var contLabel = new Label();
    var endLabel = new Label();

    this.pushContinue(contLabel);
    this.pushBreak(endLabel);
    this.label(begLabel);
    this.visit(node.body());
    this.popBreak();
    this.popContinue();
    this.label(contLabel);
    this.cjump(node.location(), this.transformExpr(node.cond()), begLabel, endLabel);
    this.label(endLabel);
    return null;
  },

  visitForNode: function(node) {
    var begLabel = new Label();
    var bodyLabel = new Label();
    var contLabel = new Label();
    var endLabel = new Label();

    this.visit(node.init());
    this.label(begLabel);
    this.cjump(node.location(), this.transformExpr(node.cond()), 
                  bodyLabel, endLabel);
    this.label(bodyLabel);
    this.pushContinue(contLabel);
    this.pushBreak(endLabel);
    this.visit(node.body());
    this.popBreak();
    this.popContinue();
    this.label(contLabel);
    this.visit(node.incr());
    this.jump(begLabel);
    this.label(endLabel);
    return null;
  },

  visitBreakNode: function(node) {
    this.jump(node.location(), this.currentBreakTarget());
    return null;
  },

  visitContinueNode: function(node) {
    this.jump(node.location(), this.currentContinueTarget());
    return null;
  },

  visitLabelNode: function(node) {
    this._stmts.push(new ir.LabelStmt(node.location(), 
                     this.defineLabel(node.name(), node.location())));
    if (node.stmt() != null) {
      this.visit(node.stmt());
    }
    return null;
  },

  visitGotoNode: function(node) {
    this.jump(node.location(), this.referLabel(node.target()));
  },

  visitReturnNode: function(node) {
    this._stmts.push(new ir.Return(node.location(),
                     node.expr() == null ? null : this.transformExpr(node.expr())));
    return null;
  },

  defineLabel: function(name, loc) {
    var ent = this.getJumpEntry(name);
    if (ent._isDefined) {
      throw new Error("duplicated jump labels in " + name + "(): " + name);
    }
    ent._isDefined = true;
    ent._location = loc;
    return ent._label;
  },

  referLabel: function(name) {
    var ent = this.getJumpEntry(name);
    ent._numRefered++;
    return ent._label;
  },

  getJumpEntry: function(name) {
    var ent = this._jumpMap.get(name);
    if (ent == null) {
      ent = new JumpEntry(new Label(name));
      this._jumpMap.set(name, ent);
    }
    return ent;
  },

  checkJumpLinks: function(jumpMap) {
    for (var key of jumpMap.keys()) {
      var labelName = key;
      var jump = jumpMap.get(key); // JumpEntry
      if (!jump._isDefined) {
        this.error(jump._location, "undefined label: " + labelName);
      }
      if (jump._numRefered === 0) {
        this.warn(jump._location, "useless label: " + labelName);
      }
    }
  },

  //
  // Expressions (with branches)
  //
 
  visitCondExprNode: function(node) {
    var thenLabel = new Label();
    var elseLabel = new Label();
    var endLabel  = new Label();
    var v = this.tmpVar(node.type());

    var cond = this.transformExpr(node.cond());
    this.cjump(node.location(), cond, thenLabel, elseLabel);
    this.label(thenLabel);
    this.assign(node.thenExpr().location(), 
                this.ref(v), this.transformExpr(node.thenExpr()));
    this.jump(endLabel);
    this.label(elseLabel);
    this.assign(node.elseExpr().location(), 
                this.ref(v), this.transformExpr(node.elseExpr()));
    this.jump(endLabel);
    this.label(endLabel);
    return this.isStatement() ? null : this.ref(v);
  },

  visitLogicalAndNode: function(node) {
    var rightLabel = new Label();
    var endLabel   = new Label();
    var v = this.tmpVar(node.type());

    this.assign(node.left().location(), this.ref(v),
                this.transformExpr(node.left()));
    this.cjump(node.location(), this.ref(v), rightLabel, endLabel);
    this.label(rightLabel);
    this.assign(node.right().location(), this.ref(v),
                this.transformExpr(node.right()));
    this.label(endLabel);
    return this.isStatement() ? null: this.ref(v); 
  },

  visitLogicalOrNode: function(node) {
    var rightLabel = new Label();
    var endLabel   = new Label();
    var v = this.tmpVar(node.type());

    this.assign(node.left().location(), this.ref(v),
                this.transformExpr(node.left()));
    this.cjump(node.location(), this.ref(v), endLabel, rightLabel);
    this.label(rightLabel);
    this.assign(node.right().location(), this.ref(v),
                this.transformExpr(node.right()));
    this.label(endLabel);
    return this.isStatement() ? null: this.ref(v); 
  },
 
  //
  // Expressions (with side effects)
  //

  visitAssignNode: function(node) {
    var lloc = node.lhs().location();
    var rloc = node.rhs().location();
    if (this.isStatement()) {
      // Evaluate RHS before LHS.
      var rhs = this.transformExpr(node.rhs());
      this.assign(lloc, this.transformExpr(node.lhs()), rhs);
      return null;
    } else {
      // lhs = rhs -> tmp = rhs, lhs = tmp, tmp
      var tmp = this.tmpVar(node.rhs().type());
      this.assign(rloc, this.ref(tmp), this.transformExpr(node.rhs()));
      this.assign(lloc, this.transformExpr(node.lhs()), this.ref(tmp));
      return this.ref(tmp);
    }
  },

  visitOpAssignNode: function(node) {
    var rhs = this.transformExpr(node.rhs());
    var lhs = this.transformExpr(node.lhs());
    var t   = node.lhs().type();
    var op = ir.Op.internBinary(node.operator(), t.isSigned());
    return this.transformOpAssign(node.location(), op, t, lhs, rhs);
  },

  visitPrefixOpNode: function(node) {
    var t = node.expr().type();
    return this.transformOpAssign(node.location(),
                                  this.binOp(node.operator()), t,
                                  this.transformExpr(node.expr()),
                                  this.imm(t, 1));
  },

  visitSuffixOpNode: function(node) {
    var expr = this.transformExpr(node.expr());
    var t    = node.expr().type();
    var op   = this.binOp(node.operator());
    var loc  = node.location();

    if (this.isStatement()) {
      this.transformOpAssign(loc, op, t, expr, this.imm(t, 1));
      return null;
    } else if (expr.isVar()) {
      // cont(expr++) -> tmp = expr; expr = tmp + 1; cont(tmp)
      var tmp = this.tmpVar(node.type());
      this.assign(loc, this.ref(tmp), expr);
      this.assign(loc, expr, this.bin(op, t, this.ref(tmp), this.imm(t, 1)));
      return this.ref(tmp);
    } else {
      // cont(expr++) -> a = &expr; tmp = *a; *a = *a + 1; cont(tmp)
      var a = this.tmpVar(this.pointerTo(t)); // DefinedVariable
      var tmp = this.tmpVar(t); // DefinedVariable
      this.assign(loc, this.ref(a), this.addressOf(expr));
      this.assign(loc, this.ref(tmp), this.mem(a));
      this.assign(loc, this.mem(a), this.bin(op, t, this.mem(a), this.imm(t, 1)));
      return this.ref(tmp);
    }
  },

  transformOpAssign: function(loc, op, lhsType, lhs, rhs) {
    // Location loc, Op op, Type lhsType, Expr lhs, Expr rhs
    if (lhs.isVar()) {
      // cont(lhs += rhs) -> lhs = lhs + rhs; cont(lhs)
      this.assign(loc, lhs, this.bin(op, lhsType, lhs, rhs));
      return this.isStatement() ? null : lhs;
    } else {
      // cont(lhs += rhs) -> a = &lhs; *a = *a + rhs; cont(*a)
      var a = this.tmpVar(this.pointerTo(lhsType));
      this.assign(loc, this.ref(a), this.addressOf(lhs));
      this.assign(loc, this.mem(a), this.bin(loc, lhsType, this.mem(a), rhs));
      return this.isStatement() ? null : this.mem(a);
    }
  },

  bin: function(op, leftType, left, right) {
    // Op op, Type leftType, Expr left, Expr right
    if (this.isPointerArithmetic(op, leftType)) {
      return new ir.Bin(left.type(), op, left, 
                        new ir.Bin(right.type(), ir.Op.MUL,
                                   right, this.ptrBaseSize(leftType)));
    } else {
      return new ir.Bin(left.type(), op, left, right);
    }
  },

  visitFuncallNode: function(node) {
    var args = []; // Expr[]
    var nodeArgs = node.args();
    for(var i = nodeArgs.length-1; i >= 0; i--) {
      args.unshift(this.transformExpr(nodeArgs[i]));
    }
    var call = new ir.Call(this.asmType(node.type()), 
                           this.transformExpr(node.expr()), args);
    if (this.isStatement()) {
      this._stmts.push(new ir.ExprStmt(node.location(), call));
      return null;
    } else {
      var tmp = this.tmpVar(node.type());
      this.assign(node.location(), this.ref(tmp), call);
      return this.ref(tmp);
    }
  },

  //
  // Expressions (no side effects)
  //

  visitBinaryOpNode: function(node) {
    var right = this.transformExpr(node.right());
    var left  = this.transformExpr(node.left());
    var op    = ir.Op.internBinary(node.operator(), node.type().isSigned());
    var t     = node.type();
    var r = node.right().type();
    var l = node.left().type();
    if (this.isPointerDiff(op, l, r)) {
      // ptr - ptr -> (ptr - ptr) / ptrBaseSize
      var tmp = new ir.Bin(this.asmType(t), op, left, right);
      return new ir.Bin(this.asmType(t), ir.Op.S_DIV, tmp, this.ptrBaseSize(l));
    } else if (this.isPointerArithmetic(op, l)) {
      // ptr + int -> ptr + (int * ptrBaseSize)
      return new ir.Bin(this.asmType(t), op, 
                        left,
                        new ir.Bin(this.asmType(r), ir.Op.MUL, 
                                   right,
                                   this.ptrBaseSize(l)));
    } else if (this.isPointerArithmetic(op, r)) {
      // int + ptr -> (int * ptrBaseSize) + ptr
      return new ir.Bin(this.asmType(t), op, 
                        new ir.Bin(this.asmType(l), ir.Op.MUL, 
                                   left,
                                   this.ptrBaseSize(r)),
                        right);
    } else {
      // int + int
      return new ir.Bin(this.asmType(t), op, left, right);
    }
  },

  visitUnaryOpNode: function(node) {
    if (node.operator() === '+') {
      // +expr -> expr
      return this.transformExpr(node.expr());
    } else {
      return new ir.Uni(this.asmType(node.type()),
                        ir.Op.internUnary(node.operator()),
                        this.transformExpr(node.expr()));
    }
  },

  visitArefNode: function(node) {
    var expr = this.transformExpr(node.baseExpr());
    var offset = new ir.Bin(this.ptrdiff_t(), ir.Op.MUL,
                            this.size(node.elementSize()),
                            this.transformIndex(node));
    var addr = new ir.Bin(this.ptr_t(), ir.Op.ADD, expr, offset);
    return this.mem(addr, node.type());
  },

  // For multidimension array: t[e][d][c][b][a] ary;
  // &ary[a0][b0][c0][d0][e0]
  //     = &ary + edcb*a0 + edc*b0 + ed*c0 + e*d0 + e0
  //     = &ary + (((((a0)*b + b0)*c + c0)*d + d0)*e + e0) * sizeof(t)
  //
  /**
   * @parma  {Object} node // ArefNode
   * @return {Object}      // Expr
   */
  
  transformIndex: function(node) {
    if (node.isMultiDimension()) {
      return new ir.Bin(this.int_t(), ir.Op.ADD, 
                        this.transformExpr(node.index()),
                        new ir.Bin(this.int_t(), ir.Op.MUL,
                                   this.transformIndex(node.expr()),
                                   new ir.Int(node.length())));
    } else {
      return this.transformExpr(node.index());
    }
  },

  visitMemberNode: function(node) {
    var expr = this.addressOf(this.transformExpr(node.expr()));
    var offset = this.ptrdiff(node.offset());
    var addr = new ir.Bin(this.ptr_t(), ir.Op.ADD, expr, offset);
    return node.isLoadable() ? this.mem(addr, node.type()) : addr;
  },

  visitPtrMemberNode: function(node) {
    var expr = this.transformExpr(node.expr());
    var offset = this.ptrdiff(node.offset());
    var addr = new ir.Bin(this.ptr_t(), ir.Op.ADD, expr, offset);
    return node.isLoadable() ? this.mem(addr, node.type()) : addr;
  },

  visitDereferenceNode: function(node) {
    var addr = this.transformExpr(node.expr());
    return node.isLoadable() ? this.mem(addr, node.type()) : addr;
  },

  visitAddressNode: function(node) {
    var e = this.transformExpr(node.expr());
    return node.expr().isLoadable() ? this.addressOf(e) : e;
  },

  visitCastNode: function(node) {
    if (node.isEffectiveCast()) {
      return new ir.Uni(this.asmType(node.type()),
                        node.expr().type().isSigned() ? ir.Op.S_CAST : ir.Op.U_CAST,
                        this.transformExpr(node.expr()));
    } else if (this.isStatement()) {
      this.visit(node.expr());
      return null;
    } else {
      return this.transformExpr(node.expr());
    }
  },

  visitSizeofExprNode: function(node) {
    return new ir.Int(this.size_t(), node.expr().allocSize());
  },

  visitSizeofTypeNode: function(node) {
    return new ir.Int(this.size_t(), node.operand().allocSize());
  },

  visitVariableNode: function(node) {
    if (node.entity().isConstant()) {
      return this.transformExpr(node.entity().value());
    }
    var v = this.ref(node.entity());
    return node.isLoadable() ? v : this.addressOf(v);
  },

  visitIntegerLiteralNode: function(node) {
    return new ir.Int(this.asmType(node.type()), node.value());
  },

  visitStringLiteralNode: function(node) {
    return new ir.Str(this.asmType(node.type()), node.entry());
  },

  //
  // Utilities
  //
  
  isPointerDiff: function(op, l, r) {
    // Op op, Type l, Type r
    return this.op === ir.Op.SUB && l.isPointer() && r.isPointer();
  },

  isPointerArithmetic: function(op, operandType) {
    switch(op) {
      case ir.Op.ADD:
      case ir.Op.SUB:
        return operandType.isPointer();
      default:
        return false;
    }
  },

  ptrBaseSize: function(t) {
    // Type t
    return new ir.Int(this.ptrdiff_t(), t.baseType().size());
  },

  // unary ops -> binary ops
  binOp: function(uniOp) {
    return uniOp === '++' ? ir.Op.ADD : ir.Op.SUB;
  },

  /**
   * @param  {Object} expr // Expr
   * @return {Object}      // Expr
   */

  addressOf: function(expr) {
    return expr.addressNode(this.ptr_t());
  },

  /**
   * @param  {Object} ent  // Entity
   * @return {Object}      // Expr
   */

  ref: function(ent) {
    return new ir.Var(this.varType(ent.type()), ent);
  },

  // @return {Object} // Mem
  mem: function(_1, _2) {
    if (_1 instanceof ir.Expr) {
      // mem(expr) -> (Mem expr)
      // Expr expr, Type t
      var expr = _1;
      var t    = _2;
      return new ir.Mem(this.asmType(t), expr);
    } else {
      // mem(ent) -> (Mem (Var ent))
      // Entity ent
      var ent  = _1;
      return new ir.Mem(this.asmType(ent.type().baseType()), this.ref(ent));
    }
  },

  /**
   * @param  {Number} n
   * @return {Object} // Int
   */

  ptrdiff: function(n) {
    return new ir.Int(this.ptrdiff_t(), n);
  },

  size: function(n) {
    return new ir.Int(this.size_t(), n);
  },

  imm: function(operandType, n) {
    // Type operandType, Number n
    if (operandType.isPointer()) {
      return new ir.Int(this.ptrdiff_t(), n);
    } else {
      return new ir.Int(this.int_t(), n);
    }
  },

  /**
   * @param  {Object} t // Type
   * @return {Object}   // Type
   */

  pointerTo: function(t) {
    return this._typeTable.pointerTo(t);
  },

  /**
   * @param  {Object} t // Type
   * @return {Object}   // asm.Type
   */

  asmType: function(t) {
    if (t.isVoid()) return this.int_t();
    return asm.Type.get(t.size());
  },

  varType: function(t) {
    if (! t.isScalar()) {
      return null;
    }
    return asm.Type.get(t.size());
  },

  int_t: function() {
      return asm.Type.get(this._typeTable.intSize());
  },

  size_t: function() {
      return asm.Type.get(this._typeTable.longSize());
  },

  ptr_t: function() {
      return asm.Type.get(this._typeTable.pointerSize());
  },

  ptrdiff_t: function() {
      return asm.Type.get(this._typeTable.longSize());
  },

  warn: function(location, msg) {
    console.log(location + ' ' + msg);
  },

  error: function(location, msg) {
    ErrorHandler.error('IRGen error', 
                       location.fileName(),
                       location.line(),
                       location.col(),
                       msg);
  }
});

function JumpEntry(label) {
  this._label = label;
  this._numRefered = 0;
  this._isDefined = false;
  this._location;
}

