var Statistics = require('../../asm/Statistics');
var asm = require('../../asm/index');
var Register = require('../../sysdep/x86/Register');
var RegisterClass = require('../../sysdep/x86/RegisterClass');
module.exports = AssemblyCode;

function AssemblyCode(naturalType, stackWordSize, labelSymbols) {
  this._naturalType = naturalType;         // asm.Type
  this._stackWordSize = stackWordSize;     // Number
  this._labelymbols = labelSymbols;        // SymbolTable
  this._virtualStack = new VirtualStack(naturalType); // VirtualStack
  this._assemblies = []; // Assembly[]
  this._statistics;      // Statistics
};

AssemblyCode.prototype = {
  assemblies: function() {
    return this._assemblies;
  },

  addAll: function(assemblies) {
    this._assemblies = this._assemblies.concat(assemblies);
  },

  toSource: function() {
    var buf = "";
    for (var asm of this._assemblies) {
      buf += asm.toSource(this._labelymbols);
      buf += '\n';
    }
    return buf;
  },

  apply: function(peepholeOptimizer) {
    this._assemblies = peepholeOptimizer.optimize(this._assemblies);
  },

  statistics: function() {
    if (this._statistics == null) {
      this._statistics = Statistics.collect(this._assemblies);
    }
    return this._statistics;
  },

  doesUses: function(reg) {
    return this.statistics().doesRegisterUsed(reg);
  },

  label: function(_1) {
    if (_1 instanceof asm.Symbol) {
      this._assemblies.push(new asm.Label(_1));
    } else if (_1 instanceof asm.Label) {
      this._assemblies.push(_1)
    } else {
      throw new Error('#label arguments error');
    }
  },

  reduceLabels: function() {
    var stats = this.statistics();
    var result = []; // Assembly[]
    for (var asm of this._assemblies) {
      if (asm.isLabel() && ! stats.doesSymbolUsed(asm)) {
        ;
      } else {
        result.push(asm);
      }
    }
    this._assemblies = result;
  },

  directive: function(direc) {
    this._assemblies.push(new asm.Directive(direc));
  },

  insn: function(_1, _2, _3, _4) {
    var op;     // String
    var suffix; // String
    var a, b;   // Operand
    var t;      // asm.Type
    if (arguments.length === 1) {
      var op = _1;
      this._assemblies.push(new asm.Instruction(op));
    } else if (arguments.length === 2) {
      op = _1;
      a = _2;
      this._assemblies.push(new asm.Instruction(op, '', a));
    } else if (arguments.length === 3 && typeof _1 === 'string') {
      op = _1;
      suffix = _2;
      a = _3;
      this._assemblies.push(new asm.Instruction(op, suffix, a));
    } else if (arguments.length === 3 && (_1 instanceof asm.Type)) {
      t = _1;
      op = _2;
      a = _3;
      this._assemblies.push(new asm.Instruction(op, this.typeSuffix(t), a));
    } else if (arguments.length === 4 && typeof _1 === 'string') {
      op = _1;
      suffix = _2;
      a = _3;
      b = _4;
      this._assemblies.push(new asm.Instruction(op, suffix, a, b));
    } else if (arguments.length === 4 && (_1 instanceof asm.Type)) {
      t = _1;
      op = _2;
      a = _3;
      b = _4;
      this._assemblies.push(new asm.Instruction(op, this.typeSuffix(t), a, b));
    } else {
      throw new Error('wrong arguments for insn');
    }
  },

  typeSuffix: function(t1, t2) {
    return this._typeSuffix(t1) + (t2 == null?'':this._typeSuffix(t2));
  },
  
  _typeSuffix: function(t) {
    switch (t) {
    case asm.Type.INT8: return "b";
    case asm.Type.INT16: return "w";
    case asm.Type.INT32: return "l";
    case asm.Type.INT64: return "q";
    default:
      throw new Error("unknown register type: " + t.size());
    }
  },

  //
  // directives
  //

  _file: function(name) {
    this.directive(".file\t" + name);
  },

  _text: function() {
    this.directive("\t.text");
  },

  _data: function() {
    this.directive("\t.data");
  },

  _section: function(name, flags, type, group, linkage) {
    if (arguments.length === 1) {
      this.directive("\t.section\t" + name);
    } else {
      this.directive("\t.section\t" + name + "," + flags + "," + type + "," + group + "," + linkage);
    }
  },

  _globl: function(sym) {
    this.directive(".globl " + sym.name());
  },

  _local: function(sym) {
    this.directive(".local " + sym.name());
  },

  _hidden: function(sym) {
    this.directive("\t.hidden\t" + sym.name());
  },

  _comm: function(sym, size, alignment) {
    this.directive("\t.comm\t" + sym.name() + "," + size + "," + alignment);
  },

  _align: function(n) {
    this.directive("\t.align\t" + n);
  },

  _type: function(sym, type) {
    this.directive("\t.type\t" + sym.name() + "," + type);
  },

  _size: function(sym, size) {
    this.directive("\t.size\t" + sym.name() + "," + size.toString());
  },

  _byte: function(val) {
    this.directive(".byte\t" + val.toString());
  },

  _value: function(val) {
    this.directive(".value\t" + val.toString());
  },

  _long: function(val) {
    this.directive(".long\t" + val.toString());
  },

  _quad: function(val) {
    this.directive(".quad\t" + val.toString());
  },

  _string: function(str) {
    this.directive("\t.string\t" + str.toString());
  },

  //
  // Virtual Stack
  //
  
  virtualPush: function(reg) {
    this._virtualStack.extend(this._stackWordSize);
    this.mov(reg, this._virtualStack.top());
  },

  virtualPop: function(reg) {
    this.mov(this._virtualStack.top(), reg);
    this._virtualStack.rewind(this._stackWordSize);
  },

  //
  // Instructions
  //

  jmp: function(label) {
    this.insn("jmp", new asm.DirectMemoryReference(label.symbol()));
  },

  jnz: function(label) {
    this.insn("jnz", new asm.DirectMemoryReference(label.symbol()));
  },

  je: function(label) {
    this.insn("je", new asm.DirectMemoryReference(label.symbol()));
  },

  cmp: function(a, b) {
    this.insn(b.type(), "cmp", a, b);
  },

  sete: function(reg) {
    this.insn("sete", reg);
  },

  setne: function(reg) {
    this.insn("setne", reg);
  },

  seta: function(reg) {
    this.insn("seta", reg);
  },

  setae: function(reg) {
    this.insn("setae", reg);
  },

  setb: function(reg) {
    this.insn("setb", reg);
  },

  setbe: function(reg) {
    this.insn("setbe", reg);
  },

  setg: function(reg) {
    this.insn("setg", reg);
  },

  setge: function(reg) {
    this.insn("setge", reg);
  },

  setl: function(reg) {
    this.insn("setl", reg);
  },

  setle: function(reg) {
    this.insn("setle", reg);
  },

  test: function(a, b) {
    this.insn(b.type(), "test", a, b);
  },

  push: function(reg) {
    this.insn("push", this.typeSuffix(this._naturalType), reg);
  },

  pop: function(reg) {
    this.insn("pop", this.typeSuffix(this._naturalType), reg);
  },

  // call function by relative address
  call: function(sym) {
    this.insn("call", new asm.DirectMemoryReference(sym));
  },

  // call function by absolute address
  callAbsolute: function(reg) {
    this.insn("call", new asm.AbsoluteAddress(reg));
  },

  ret: function() {
    this.insn("ret");
  },

  mov: function(src, dest) {
    if (src instanceof asm.Register && dest instanceof asm.Register) { // move
      this.insn(this._naturalType, "mov", src, dest);
    } else if (src instanceof asm.Operand && dest instanceof asm.Register) { // load
      this.insn(dest.type(), "mov", src, dest);
    } else if (src instanceof asm.Register && dest instanceof asm.Operand) { //save
      this.insn(src.type(), "mov", src, dest);
    } else {
      throw new Error('mov arguments error');
    }
  },

  // for stack access
  relocatableMov: function(src, dest) {
    // Operand src,dest
    this.assemblies.add(new asm.Instruction("mov", this.typeSuffix(this._naturalType), src, dest, true));
  },

  movsx: function(src, dest) {
    // Register src,dest
    this.insn("movs", this.typeSuffix(src.type(), dest.type()), src, dest);
  },

  movzx: function(src, dest) {
    // Register src,dest
    this.insn("movz", this.typeSuffix(src.type(), dest.type()), src, dest);
  },

  movzb: function(src, dest) {
    // Register src,dest
    this.insn("movz", "b" + this.typeSuffix(dest.type()), src, dest);
  },

  lea: function(src, dest) {
    // Operand src, Register dest
    this.insn(this._naturalType, "lea", src, dest);
  },

  neg: function(reg) {
    this.insn(reg.type(), "neg", reg);
  },

  add: function(diff, base) {
    // Operand diff, Register base
    this.insn(base.type(), "add", diff, base);
  },

  sub: function(diff, base) {
    // Operand diff, Register base
    this.insn(base.type(), "sub", diff, base);
  },

  imul: function(m, base) {
    // Operand m, Register base
    this.insn(base.type(), "imul", m, base);
  },

  cltd: function() {
    this.insn("cltd");
  },

  div: function(base) {
    // Register base
    this.insn(base.type(), "div", base);
  },

  idiv: function(base) {
    // Register base
    this.insn(base.type(), "idiv", base);
  },

  not: function(reg) {
    // Register reg
    this.insn(reg.type(), "not", reg);
  },

  and: function(bits, base) {
    // Operand bits, Register base
    this.insn(base.type(), "and", bits, base);
  },

  or: function(bits, base) {
    // Operand bits, Register base
    this.insn(base.type(), "or", bits, base);
  },

  xor: function(bits, base) {
    // Operand bits, Register base
    this.insn(base.type(), "xor", bits, base);
  },

  sar: function(bits, base) {
    // Register bits, Register base
    this.insn(base.type(), "sar", bits, base);
  },

  sal: function(bits, base) {
    // Register bits, Register base
    this.insn(base.type(), "sal", bits, base);
  },

  shr: function(bits, base) {
    // Register bits, Register base
    this.insn(base.type(), "shr", bits, base);
  },
};


function VirtualStack() {
  this._offset = 0;
  this._max = 0;
  this._memrefs = []; // IndirectMemoryReference[]
}

VirtualStack.prototype = {
  reset: function(naturalType) {
    this._naturalType = naturalType;
    this._offset = 0;
    this._max = 0;
    this._memrefs = [];
  },

  maxSize: function() {
    return this._max;
  },

  extend: function(len) {
    this._offset += len;
    this._max = Math.max(this._offset, this._max);
  },

  rewind: function(len) {
    this._offset -= len;
  },

  top: function() {
    var mem = this.relocatableMem(-this._offset, this.bp());
    this._memrefs.push(mem);
    return mem;
  },

  relocatableMem: function(offset, base) {
    return asm.IndirectMemoryReference.relocatable(offset, base);
  },

  bp: function() {
    return new Register(RegisterClass.BP, this.naturalType);
  },

  fixOffset: function(diff) {
    for (var mem of this._memrefs) {
      mem.fixOffset(diff);
    }
  }
}

