var $extend = require('../../util/extend');
var $import = require('../../util/import');
var ErrorHandler = require('../../util/ErrorHandler');
var IRVisitor = require('../AbstractVisitor/IRVisitor');
var asm = require('../../asm/index');
var AssemblyCode = require('../../sysdep/x86/AssemblyCode');
var RegisterClass = require('../../sysdep/x86/RegisterClass');
var Register = require('../../sysdep/x86/Register');
var Op = require('../../ir/Op');
var Int = require('../../ir/Int');
var Str = require('../../ir/Str');
module.exports = CodeGenerator;

$extend(CodeGenerator, IRVisitor)
function CodeGenerator() {
  // Type naturalType
  this._naturalType = asm.Type.INT32;
  this._as; // AssemblyCode
  this._epilogue; // Label
  this._calleeSaveRegistersCache;
};

CodeGenerator.LABEL_SYMBOL_BASE = '.L';
CodeGenerator.CONST_SYMBOL_BASE = '.LC';
CodeGenerator.STACK_WORD_SIZE = 4;
CodeGenerator.PARAM_START_WORD = 2;
CodeGenerator.CALLEE_SAVE_REGISTERS = [
        RegisterClass.BX, RegisterClass.BP,
        RegisterClass.SI, RegisterClass.DI]


$import(CodeGenerator.prototype, {
  /** Compiles IR and generates assembly code. */
  generate: function(ir) {
    this.locateSymbols(ir);
    return this.generateAssemblyCode(ir);
  },

  //
  // locateSymbols
  //

  locateSymbols: function(ir) {
    var constSymbols = new asm.SymbolTable(CodeGenerator.CONST_SYMBOL_BASE);
    for (var ent of ir.constantTable().values()) {
      this.locateStringLiteral(ent, constSymbols);
    }
    for (var v of ir.allGlobalVariables()) {
      this.locateGlobalVariable(v);
    }
    for (var func of ir.allFunctions()) {
      this.locateFunction(func);
    }
  },

  locateStringLiteral: function(ent, syms) {
    // ConstantEntry ent, SymbolTable syms
    ent.setSymbol(syms.newSymbol());
    ent.setMemref(this.mem(ent.symbol()));
    ent.setAddress(this.imm(ent.symbol()));
  },

  locateGlobalVariable: function(ent) {
    var sym = this.symbol(ent.symbolString(), ent.isPrivate());
    ent.setMemref(this.mem(sym));
    ent.setAddress(this.imm(sym));
  },

  locateFunction: function(func) {
    func.setCallingSymbol(this.callingSymbol(func));
    this.locateGlobalVariable(func);
  },

  symbol: function(sym, isPrivate) {
    // String sym, boolean isPrivate
    return isPrivate ? this.privateSymbol(sym) : this.globalSymbol(sym);
  },

  globalSymbol: function(sym) {
    // String sym
    return new asm.NamedSymbol(sym);
  },

  privateSymbol: function(sym) {
    // String sym
    return new asm.NamedSymbol(sym);
  },

  callingSymbol: function(func) {
    if (func.isPrivate()) {
      return this.privateSymbol(func.symbolString());
    } else {
      var sym = this.globalSymbol(func.symbolString());
      return sym;
    }
  },

  //
  // generateAssemblyCode
  //

  generateAssemblyCode: function(ir) {
    var file = this.newAssemblyCode();
    file._file('"' + ir.fileName() + '"');
    if (ir.isGlobalVariableDefined()) {
      this.generateDataSection(file, ir.definedGlobalVariables());
    }
    if (ir.isStringLiteralDefined()) {
      this.generateReadOnlyDataSection(file, ir.constantTable());
    }
    if (ir.isFunctionDefined()) {
      this.generateTextSection(file, ir.definedFunctions());
    }
    if (ir.isCommonSymbolDefined()) {
      this.generateCommonSymbols(file, ir.definedCommonSymbols());
    }
    return file;
  },

  newAssemblyCode: function() {
    return new AssemblyCode(this._naturalType,  
                    CodeGenerator.STACK_WORD_SIZE,
                    new asm.SymbolTable(CodeGenerator.LABEL_SYMBOL_BASE));
  },

  /** Generates initialized entries */
  generateDataSection: function(file, gvars) {
    // AssemblyCode file, DefinedVariable[] gvars
    file._data();
    for (var v of gvars) {
      var sym = this.globalSymbol(v.symbolString());
      if (!v.isPrivate()) {
        file._globl(sym);
      }
      file._align(v.alignment());
      file._type(sym, "@object");
      file._size(sym, v.allocSize());
      file.label(sym);
      this.generateImmediate(file, v.type().allocSize(), v.ir());
    }
  },

  /** Generates immediate values for .data section */
  generateImmediate: function(file, size, node) {
    // AssemblyCode file, long size, Expr node
    if (node instanceof Int) {
      switch(size) {
      case 1: file._byte(node.value());    break;
      case 2: file._value(node.value());   break;
      case 4: file._long(node.value());    break;
      case 8: file._quad(node.value());    break;
      default:
          throw new Error("entry size must be 1,2,4,8");
      }
    } else if (node instanceof Str) {
      switch (size) {
      case 4: file._long(node.symbol());   break;
      case 8: file._quad(node.symbol());   break;
      default:
          throw new Error("pointer size must be 4,8");
      }
    } else {
      throw new Error("unknown literal node type" + node.getClass());
    }
  },

  /** Generates .rodata entries (constant strings) */
  generateReadOnlyDataSection: function(file, constantTable) {
    // AssemblyCode file, ConstantTable constantTable
    file._section('.rodata');
    for (var ent of constantTable.values()) {
      file.label(ent.symbol());
      file._string(ent.value());
    }
  },

  generateTextSection: function(file, functions) {
    // AssemblyCode file, DefinedFunction[] functions
    file._text();
    for (var func of functions) {
      var sym = this.globalSymbol(func.name());
      if (! func.isPrivate()) {
        file._globl(sym);
      }
      file._type(sym, '@function');
      file.label(sym);
      this.compileFunctionBody(file, func);
      file._size(sym, '.-' + sym.toSource());
    }
  },

  /** Generates BSS entries */
  generateCommonSymbols: function(file, variables) {
    // AssemblyCode file, DefinedVariable[] variables
    for (var v of variables) {
      var sym = this.globalSymbol(v.symbolString());
      if (v.isPrivate()) {
        file._local(sym);
      }
      file._comm(sym, v.allocSize(), v.alignment());
    }
  },

  //
  // Compile Function
  //
  
  /* Standard IA-32 stack frame layout
   *
   * ======================= esp #3 (stack top just before function call)
   * next arg 1
   * ---------------------
   * next arg 2
   * ---------------------
   * next arg 3
   * ---------------------   esp #2 (stack top after alloca call)
   * alloca area
   * ---------------------   esp #1 (stack top just after prelude)
   * temporary
   * variables...
   * ---------------------   -16(%ebp)
   * lvar 3
   * ---------------------   -12(%ebp)
   * lvar 2
   * ---------------------   -8(%ebp)
   * lvar 1
   * ---------------------   -4(%ebp)
   * callee-saved register
   * ======================= 0(%ebp)
   * saved ebp
   * ---------------------   4(%ebp)
   * return address
   * ---------------------   8(%ebp)
   * arg 1
   * ---------------------   12(%ebp)
   * arg 2
   * ---------------------   16(%ebp)
   * arg 3
   * ...
   * ...
   * ======================= stack bottom
   */
  
  alignStack: function(size) {
    return this.align(size, CodeGenerator.STACK_WORD_SIZE);
  },

  align: function(n, alignment) {
    return Math.floor((n + alignment - 1) / alignment) * alignment;
  },

  stackSizeFromWordNum: function(numWords) {
    return numWords * CodeGenerator.STACK_WORD_SIZE;
  },

  compileFunctionBody: function(file, func) {
    // AssemblyCode file, DefinedFunction func
    var frame = new StackFrameInfo();
    this.locateParameters(func.parameters());
    frame._lvarSize = this.locateLocalVariables(func.lvarScope());
    var body = this.optimize(this.compileStmts(func)); // AssemblyCode
    frame._saveRegs = this.usedCalleeSaveRegisters(body);
    frame._tempSize = body._virtualStack.maxSize();
    this.fixLocalVariableOffsets(func.lvarScope(), frame.lvarOffset());
    this.fixTempVariableOffsets(body, frame.tempOffset());
    this.generateFunctionBody(file, body, frame);
  },

  optimize: function(body) {
    // AssemblyCode body
    // body.apply(PeepholeOptimizer.defaultSet());
    // body.reduceLabels();
    return body;
  },

  compileStmts: function(func) {
    // DefinedFunction func
    this._as = this.newAssemblyCode();
    this._epilogue = new asm.Label();
    for (var s of func.ir()) {
      this.compileStmt(s);
    }
    this._as.label(this._epilogue);
    return this._as;
  },

  /**
   * does NOT include BP
   *
   * @param  {Object} body // AssemblyCode
   * @return {Array}       // Register[]
   */
  
  usedCalleeSaveRegisters: function(body) {
    var result = [];
    for (var reg of this.calleeSaveRegisters()) {
      if (body.doesUses(reg) && reg._class !== RegisterClass.BX) {
        result.push(reg);
      }
    }
    return result;
  },

  calleeSaveRegisters: function() {
    if (this._calleeSaveRegistersCache == null) {
      var regs = [];
      for (var c of CodeGenerator.CALLEE_SAVE_REGISTERS) {
        regs.push(new Register(c, this._naturalType));
      }
      this._calleeSaveRegistersCache = regs;
    }
    return this._calleeSaveRegistersCache;
  },

  generateFunctionBody: function(file, body, frame) {
    // AssemblyCode file,body, StackFrameInfo frame
    file._virtualStack.reset();
    this.prologue(file, frame._saveRegs, frame.frameSize());
    file.addAll(body.assemblies());
    this.epilogue(file, frame._saveRegs);
    file._virtualStack.fixOffset(0);
  },

  prologue: function(file, saveRegs, frameSize) {
    file.push(this.bp());
    file.mov(this.sp(), this.bp());
    for (var reg of saveRegs) {
      file.virtualPush(reg);
    }
    this.extendStack(file, frameSize);
  },

  epilogue: function(file, savedRegs) {
    // AssemblyCode file, Register[] savedRegs
    for (var i = savedRegs.length-1; i >= 0; i--) {
      file.virtualPop(savedRegs[i]);
    }
    file.mov(this.bp(), this.sp());
    file.pop(this.bp());
    file.ret();
  },

  locateParameters: function(params) {
    // Parameter[] params
    // return addr and saved bp
    var numWords = CodeGenerator.PARAM_START_WORD;
    for (var v of params) {
      v.setMemref(this.mem(this.stackSizeFromWordNum(numWords), this.bp()));
      numWords++;
    }
  },

  /**
   * Allocates addresses of local variables, but offset is still
   * not determined, assign unfixed IndirectMemoryReference.
   */
  locateLocalVariables: function(scope, parentStackLen) {
    // LocalScope scope, Number parentStackLen
    var len = parentStackLen || 0;
    for (var v of scope.localVariables()) {
      len = this.alignStack(len + v.allocSize());
      v.setMemref(this.relocatableMem(-len, this.bp()));
    }
    var maxLen = len;
    for (var s of scope.children()) {
      var childLen = this.locateLocalVariables(s, len);
      maxLen = Math.max(maxLen, childLen);
    }
    return maxLen;
  },

  relocatableMem: function(offset, base) {
    // long offset, Register base
    return asm.IndirectMemoryReference.relocatable(offset, base);
  },

  fixLocalVariableOffsets: function(scope, len) {
    // LocalScope scope, Number len
    for (var v of scope.allLocalVariables()) {
      v.memref().fixOffset(-len);
    }
  },

  fixTempVariableOffsets: function(asm, len) {
    // AssemblyCode asm, long len
    asm._virtualStack.fixOffset(-len);
  },

  extendStack: function(file, len) {
    // AssemblyCode file, long len
    if (len > 0) {
      file.sub(this.imm(len), this.sp());
    }
  },

  rewindStack: function(file, len) {
    // AssemblyCode file, Number len
    if (len > 0) {
      file.add(this.imm(len), this.sp());
    }
  },
  
  /**
   * Implements cdecl function call:
   *    * All arguments are on stack.
   *    * Caller rewinds stack pointer.
   */

  visitCall: function(node) {
    var args = node.args();
    for (var i = args.length-1; i >= 0; i--) {
      this.compile(args[i]);
      this._as.push(this.ax());
    }
    if (node.isStaticCall()) {
      this._as.call(node.func().callingSymbol());
    } else {
      this.compile(node.expr());
      this._as.callAbsolute(this.ax());
    }
    this.rewindStack(this._as, this.stackSizeFromWordNum(node.numArgs()));
  },

  visitReturn: function(node) {
    if (node.expr() != null) {
      this.compile(node.expr());
    }
    this._as.jmp(this._epilogue);
  },

  //
  // Statements
  //

  compileStmt: function(stmt) {
    this.visit(stmt);
  },

  visitExprStmt: function(stmt) {
    this.compile(stmt.expr());
  },

  visitLabelStmt: function(node) {
    this._as.label(node.label());
  },

  visitJump: function(node) {
    this._as.jmp(node.label());
  },

  visitCJump: function(node) {
    this.compile(node.cond());
    var t = node.cond().type();
    this._as.test(this.ax(t), this.ax(t));
    this._as.jnz(node.thenLabel());
    this._as.jmp(node.elseLabel());
  },

  visitSwitch: function(node) {
    this.compile(node.cond());
    var t = node.cond().type();
    for (var c of node.cases()) {
      this._as.mov(this.imm(c._value), this.cx());
      this._as.cmp(this.cx(t), this.ax(t));
      this._as.je(c._label);
    }
    this._as.jmp(node.defaultLabel());
    return null;
  },

  //
  // Expressions
  //
  
  compile: function(node) {
    // Expr node
    this.visit(node);
  },

  visitBin: function(node) {
    var op = node.op();
    var t  = node.type();
    if (node.right().isConstant() && !this.doesRequireRegisterOperand(op)) {
      this.compile(node.left());
      this.compileBinaryOp(op, this.ax(t), node.right().asmValue());
    } else if (node.right().isConstant()) {
      this.compile(node.left());
      this.loadConstant(node.right(), this.cx());
      this.compileBinaryOp(op, this.ax(t), this.cx(t));
    } else if (node.right().isVar()) {
      this.compile(node.left());
      this.loadVariable(node.right(), this.cx(t));
      this.compileBinaryOp(op, this.ax(t), this.cx(t));
    } else if (node.right().isAddr()) {
      this.compile(node.left());
      this.loadAddress(node.right().getEntityForce(), this.cx(t));
      this.compileBinaryOp(op, this.ax(t), this.cx(t));
    } else if (node.left().isConstant()
                || node.left().isVar()
                || node.left().isAddr()) {
      this.compile(node.right());
      this._as.mov(this.ax(), this.cx());
      this.compile(node.left());
      this.compileBinaryOp(op, this.ax(t), this.cx(t));
    } else {
      this.compile(node.right());
      this._as.virtualPush(this.ax());
      this.compile(node.left());
      this._as.virtualPop(this.cx());
      this.compileBinaryOp(op, this.ax(t), this.cx(t));
    }
  },

  doesRequireRegisterOperand: function(op) {
    switch (op) {
    case Op.S_DIV:
    case Op.U_DIV:
    case Op.S_MOD:
    case Op.U_MOD:
    case Op.BIT_LSHIFT:
    case Op.BIT_RSHIFT:
    case Op.ARITH_RSHIFT:
        return true;
    default:
        return false;
    }
  },
  
  compileBinaryOp: function(op, left, right) {
    // Op op, Register left, Operand right
    switch (op) {
    case Op.ADD:
      this._as.add(right, left);
      break;
    case Op.SUB:
      this._as.sub(right, left);
      break;
    case Op.MUL:
      this._as.imul(right, left);
      break;
    case Op.S_DIV:
    case Op.S_MOD:
      this._as.cltd();
      this._as.idiv(this.cx(left.type()));
      if (op == Op.S_MOD) {
        this._as.mov(this.dx(), left);
      }
      break;
    case Op.U_DIV:
    case Op.U_MOD:
      this._as.mov(imm(0), this.dx());
      this._as.div(this.cx(left.type()));
      if (op == Op.U_MOD) {
        this._as.mov(this.dx(), left);
      }
      break;
    case Op.BIT_AND:
      this._as.and(right, left);
      break;
    case Op.BIT_OR:
      this._as.or(right, left);
      break;
    case Op.BIT_XOR:
      this._as.xor(right, left);
      break;
    case Op.BIT_LSHIFT:
      this._as.sal(this.cl(), left);
      break;
    case Op.BIT_RSHIFT:
      this._as.shr(this.cl(), left);
      break;
    case Op.ARITH_RSHIFT:
      this._as.sar(this.cl(), left);
      break;
    default:
      this._as.cmp(right, this.ax(left.type()));
      switch (op) {
      case Op.EQ:        this._as.sete (this.al()); break;
      case Op.NEQ:       this._as.setne(this.al()); break;
      case Op.S_GT:      this._as.setg (this.al()); break;
      case Op.S_GTEQ:    this._as.setge(this.al()); break;
      case Op.S_LT:      this._as.setl (this.al()); break;
      case Op.S_LTEQ:    this._as.setle(this.al()); break;
      case Op.U_GT:      this._as.seta (this.al()); break;
      case Op.U_GTEQ:    this._as.setae(this.al()); break;
      case Op.U_LT:      this._as.setb (this.al()); break;
      case Op.U_LTEQ:    this._as.setbe(this.al()); break;
      default:
        throw new Error("unknown binary operator: " + op);
      }
      this._as.movzx(this.al(), left);
    }
  },

  visitUni: function(node) {
    var src = node.expr().type(); // asm.Type
    var dest = node.type();       // asm.Type
    this.compile(node.expr());
    switch (node.op()) {
    case Op.UMINUS:
      this._as.neg(this.ax(src));
      break;
    case Op.BIT_NOT:
      this._as.not(this.ax(src));
      break;
    case Op.NOT:
      this._as.test(this.ax(src), this.ax(src));
      this._as.sete(this.al());
      this._as.movzx(this.al(), this.ax(dest));
      break;
    case Op.S_CAST:
      this._as.movsx(this.ax(src), this.ax(dest));
      break;
    case Op.U_CAST:
      this._as.movzx(this.ax(src), this.ax(dest));
      break;
    default:
      throw new Error("unknown unary operator: " + node.op());
    }
    return null;
  },

  visitVar: function(node) {
    this.loadVariable(node, this.ax());
  },

  visitInt: function(node) {
    this._as.mov(this.imm(node.value()), this.ax());
  },

  visitStr: function(node) {
    this.loadConstant(node, this.ax());
  },

  //
  // Assignable expressions
  //
  
  visitAssign: function(node) {
    if (node.lhs().isAddr() && node.lhs().memref() != null) {
      this.compile(node.rhs());
      this.store(this.ax(node.lhs().type()), node.lhs().memref());
    } else if (node.rhs().isConstant()) {
      this.compile(node.lhs());
      this._as.mov(this.ax(), this.cx());
      this.loadConstant(node.rhs(), this.ax());
      this.store(this.ax(node.lhs().type()), this.mem(this.cx()));
   } else {
      this.compile(node.rhs());
      this._as.virtualPush(this.ax());
      this.compile(node.lhs());
      this._as.mov(this.ax(), this.cx());
      this._as.virtualPop(ax());
      this.store(this.ax(node.lhs().type()), this.mem(this.cx()));
    }
  },

  visitMem: function(node) {
    this.compile(node.expr());
    this.load(this.mem(this.ax()), this.ax(node.type()));
  },

  visitAddr: function(node) {
    this.loadAddress(node.entity(), this.ax());
  },

  //
  // Utilities
  //

  /**
   * Loads constant value.  You must check node by #isConstant
   * before calling this method.
   */
  
  loadConstant: function(node, reg) {
    // Expr node, Register reg
    if (node.asmValue() != null) {
      // Int
      this._as.mov(node.asmValue(), reg);
    } else if (node.memref() != null) {
      // Str
      this._as.lea(node.memref(), reg);
    } else {
      throw new Error("must not happen: constant has no asm value");
    }
  },

  /** Loads variable content to the register. */
  loadVariable: function(v, dest) {
    // Var v, Register dest
    if (v.memref() == null) { // like: Global variable
      var a = dest.forType(this._naturalType);
      this._as.mov(v.address(), a);
      this.load(this.mem(a), dest.forType(v.type()));
    } else { // like: local Variable
      this.load(v.memref(), dest.forType(v.type()));
    }
  },

  /** Loads the address of the variable to the register. */
  loadAddress: function(ent, dest) {
    if (ent.address() != null) { // like: Global variable
      this._as.mov(ent.address(), dest);
    } else { // like: local Variable
      this._as.lea(ent.memref(), dest);
    }
  },
  ax: function(t) {
    // asm.Type t
    return new Register(RegisterClass.AX, t || this._naturalType);
  },

  al: function() { 
    return this.ax(asm.Type.INT8);     
  },

  bx: function(t) {
    // asm.Type t
    return new Register(RegisterClass.BX, t || this._naturalType);
  },

  cx: function(t) {
    // asm.Type t
    return new Register(RegisterClass.CX, t || this._naturalType);
  },

  cl: function() { 
    return this.cx(asm.Type.INT8);     
  },

  dx: function(t) {
    // asm.Type t
    return new Register(RegisterClass.DX, t || this._naturalType);
  },

  si: function() {
    return new Register(RegisterClass.SI, this._naturalType);
  },

  di: function() {
    return new Register(RegisterClass.DI, this._naturalType);
  },

  bp: function() {
    return new Register(RegisterClass.BP, this._naturalType);
  },

  sp: function() {
    return new Register(RegisterClass.SP, this._naturalType);
  },
  
  mem: function(_1, _2) {
    if (arguments.length === 1 && _1 instanceof asm.Symbol) {
      var sym = _1;
      return new asm.DirectMemoryReference(sym);
    } else if (arguments.length === 1 && _1 instanceof asm.Register) {
      var reg = _1;
      return new asm.IndirectMemoryReference(0, reg);
    } else if (arguments.length === 2 && _1 instanceof asm.Symbol) {
      var offset = _1;
      var reg = _2;
      return new asm.IndirectMemoryReference(offset, reg);
    } else if (arguments.length === 2 && typeof _1 === 'number') {
      var offset = _1;
      var reg = _2;
      return new asm.IndirectMemoryReference(offset, reg);
    } else {
      throw new Error('#mem arguments error');
    }
  },

  imm: function(_1) {
    if (_1 instanceof asm.Symbol) {
      return new asm.ImmediateValue(_1);
    } else if (_1 instanceof asm.Literal) {
      return new asm.ImmediateValue(_1);
    } else if (typeof _1 === 'number') {
      return new asm.ImmediateValue(_1);
    } else {
      throw new Error('#imm arguments error');
    }
  },

  load: function(mem, reg) {
    // MemoryReference mem, Register reg
    this._as.mov(mem, reg);
  },

  store: function(reg, mem) {
    // Register reg, MemoryReference mem
    this._as.mov(reg, mem);
  }
});



function StackFrameInfo() {
  this._saveRegs = []; // Register[]
  this._lvarSize;      // Number
  this._tempSize;      // Number
}

StackFrameInfo.prototype = {
  saveRegsSize: function() { 
    return this._saveRegs.length * CodeGenerator.STACK_WORD_SIZE; 
  },

  lvarOffset: function() { 
    return this.saveRegsSize(); 
  },

  tempOffset: function() { 
    return this.saveRegsSize() + this._lvarSize; 
  },

  frameSize: function() { 
    return this.saveRegsSize() + this._lvarSize + this._tempSize; 
  }
}
