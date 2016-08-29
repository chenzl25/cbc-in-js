var $extend = require('../util/extend');
var $import = require('../util/import');
var Assembly = require('./Assembly');
var Operand = require('./Operand');
module.exports = Instruction;

$extend(Instruction, Assembly);
function Instruction(mnemonic, suffix, _3, _4, _5) {
  // String mnemonic, String suffix, Operand operand1,operand1, boolean reloc
  this._mnemonic = mnemonic;
  this._suffix = suffix || '';
  this._operands = [];
  this._needRelocation = false;
  if (arguments.length === 3) {
    this._operands = [_3];
    this._needRelocation = false;
  }
  if (arguments.length === 4) {
    this._operands = [_3, _4];
    this._needRelocation = false;
  }
  if (arguments.length === 5) {
    this._operands = [_3, _4];
    this._needRelocation = _5;
  }
};

$import(Instruction.prototype, {
  build: function(mnemonic, o1, o2) {
    // String mnemonic, Operand o1, Operand o2
    var result;
    if (arguments.length === 2) {
      result = new Instruction(mnemonic, this._suffix);
      result._operands = [o1];
      result._needRelocation = this._needRelocation;
    }
    if (arguments.length === 3) {
      result = new Instruction(mnemonic, this._suffix);
      result._operands = [o1, o2];
      result._needRelocation = this._needRelocation;
    }
  },

  isInstruction: function() {
    return true;
  },

  mnemonic: function() {
    return this._mnemonic;
  },

  isJumpInstruction: function() {
    return this._mnemonic === 'jmp' ||
           this._mnemonic === 'jz'  ||
           this._mnemonic === 'jne' ||
           this._mnemonic === 'je'  ||
           this._mnemonic === 'jne';
  },

  numOperands: function() {
    return this._operands.length;
  },

  operand1: function() {
    return this._operands[1];
  },

  operand2: function() {
    return this._operands[2];
  },

  jmpDestination: function() {
    var ref = this._operands[0]; // DirectMemoryReference
    return ref.value();
  },

  collectStatistics: function(stats) {
    stats.instructionUsed(this._mnemonic);
    for (var i = 0; i < this._operands.length; i++) {
      this._operands[i].collectStatistics(stats);
    }
  },

  toSource: function(table) {
    var buf = '';
    buf += '\t';
    buf += this._mnemonic + this._suffix;
    var sep = '\t';
    for (var i = 0; i < this._operands.length; i++) {
      buf += sep; sep = ', ';
      buf += (this._operands[i].toSource(table));
    }
    return buf;
  },

  toString: function() {
    return '#<Insn ' + this._mnemonic + '>';
  }
});

