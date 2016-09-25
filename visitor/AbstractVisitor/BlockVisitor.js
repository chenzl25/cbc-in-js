var ir = require('../../ir/index');
module.exports = BlockVisitor;

function BlockVisitor() {

};

BlockVisitor.errorMsg = 'BlockVisitor inst type error';

BlockVisitor.prototype = {
  visit: function(inst) {
    if (inst instanceof ir.Move) return this.visitMove(inst);
    else if (inst instanceof ir.Return) return this.visitReturn(inst);
    else if (inst instanceof ir.CJump) return this.visitCJump(inst);
    else if (inst instanceof ir.Jump) return this.visitJump(inst);
    else if (inst instanceof ir.Switch) return this.visitSwitch(inst);
    else if (inst instanceof ir.LabelStmt) return this.visitLabelStmt(inst);
    else throw new Error(BlockVisitor.errorMsg);
  },

  visitInsts(stmts) {
    for (var s of stmts) {
      this.visit(s);
    }
  },
  
  visitMove: function(inst) {
    if (inst.from() instanceof ir.Bin) {
      this.visitUnit(inst.from().left());
      this.visitUnit(inst.from().right());
    } else if (inst.from() instanceof ir.Uni) {
      this.visitUnit(inst.from().expr());
    } else this.visitUnit(inst.from());
    this.visitUnit(inst.to());
  },

  visitCJump: function(inst) {
    this.visitUnit(inst.cond());
  },

  visitJump: function(inst) {
    inst.label();
  },

  visitSwitch: function(inst) {
    this.visitUnit(inst.cond());
  },

  visitReturn: function(inst) {
    if (inst.expr()) {
      this.visitUnit(inst.expr());
    }
  },

  visitLabelStmt: function(inst) {
    inst.label();
  },

  //
  // Unit
  //
  
  visitUnit: function(unit) {
    if (unit instanceof ir.Addr) return this.visitAddr(unit);
    else if (unit instanceof ir.Mem) return this.visitMem(unit);
    else if (unit instanceof ir.Reg) return this.visitReg(unit);
    else if (unit instanceof ir.Call) return this.visitCall(unit);
    else if (unit instanceof ir.Int) return this.visitInt(unit);
    else if (unit instanceof ir.Str) return this.visitStr(unit);
    else throw new Error('BlockVisitor unit type error');
  },


  visitCall: function(unit) {
    this.visitUnit(unit.expr());
    for (var i = 0; i < unit._args.length; i++) {
      this.visitUnit(unit._args[i]);
    }
  },

  visitAddr: function(unit) {
    // TODO;
    unit.entity();
  },

  visitMem: function(unit) {
    this.visitUnit(unit.expr());
  },

  visitInt: function(unit) {

  },

  visitStr: function(unit) {

  },

  visitReg: function(unit) {

  }
}