var $extend = require('../util/extend');
var $import = require('../util/import');
var ir = require('../ir');
var asm = require('../asm');
module.exports = BasicBlock;

function BasicBlock() {
  this._insts = []; // IR.Stmt[]
}

BasicBlock.prototype = {
  insts: function() {
    return this._insts;
  },

  inst: function(i) {
    return this._insts[i];
  },

  label: function() {
    return this.inst(0).label();
  },

  labelName: function() {
    return this.inst(0).label().toString();
  },

  changeJumpLabel: function(originLabelName, newLabelName) {
    var lastInst = this.inst(this.length() - 1);
    if (lastInst instanceof ir.Jump) {
      if (originLabelName == lastInst.label().toString()) {
        lastInst._label = new asm.Label(new asm.NamedSymbol(newLabelName));
      } else {
        throw new Error('changeJumpLabel Jump label error');
      }
    } else if (lastInst instanceof ir.CJump) {
      if (originLabelName == lastInst.thenLabel().toString()) {
        lastInst._thenLabel = new asm.Label(new asm.NamedSymbol(newLabelName));
      } else if (originLabelName == lastInst.elseLabel().toString()) {
        lastInst._elseLabel = new asm.Label(new asm.NamedSymbol(newLabelName));
      } else {
         throw new Error('changeJumpLabel CJump label error');
      }
    } else {
      throw new Error('changeJumpLabel impossile case');
    }
  },

  length: function() {
    return this._insts.length;
  },

  resize: function(len) {
    this._insts.length = len;
  },

  insertBefore: function(j, inst) {
    if (j < 0) j = 0;
    if (j >= this._insts.length) j = this._insts.length-1;

    this._insts.push('dummy');
    for (var i = this._insts.length-1; i > j; i--) {
      this._insts[i] = this._insts[i-1];
    }
    this._insts[j] = inst;
  },

  insertAfter: function(j, inst) {
    if (j < 0) j = 0;
    if (j >= this._insts.length) j = this._insts.length-1;

    this._insts.push('dummy');
    for (var i = this._insts.length-1; i >= j+2; i--) {
      this._insts[i] = this._insts[i-1];
    }
    this._insts[j+1] = inst;
  },

  appendInst: function(inst) {
    this._insts.push(inst);
  },

  appendInsts: function(insts) {
    this._insts = this._insts.concat(insts);
  },

  deleteInst: function(j) {
    if (j < 0) j = 0;
    if (j >= this._insts.length) j = this._insts.length-1;

    for (var i = j; i < this._insts.length; i++) {
      this._insts[i] = this._insts[i+1];
    }
    this._insts.pop();
  }
};
