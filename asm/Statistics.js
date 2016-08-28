var Label = require('./Label');
var Symbol = require('./Symbol');
module.exports = Statistics;

function Statistics() {
  this._registerUsage = new Map(); // Register -> Number
  this._insnUsage = new Map();     // String -> Number
  this._symbolUsage = new Map();   // Symbol -> Number
};

Statistics.collect = function(assemblies) {
  // Assembly[] assemblies
  var stats = new Statistics();
  for (var asm of assemblies) {
    asm.collectStatistics(stats);
  }
  return stats;
}

Statistics.prototype = {
  doesRegisterUsed: function(reg) {
    return this.numRegisterUsed(reg) > 0;
  },

  numRegisterUsed: function(reg) {
    return this.fetchCount(this._registerUsage, reg);
  },

  registerUsed: function() {
    this.incrementCount(this._registerUsage, reg);
  },

  numInstructionUsage: function(insn) {
    return this.fetchCount(this._insnUsage, insn);
  },

  instructionUsed: function(insn) {
    this.incrementCount(this._insnUsage, insn);
  },

  doesSymbolUsed: function(_1) {
    var symbol = _1;
    if (_1 instanceof Label) {
      symbol = _1.symbol();
    }
    return this.numSymbolUsed(symbol) > 0;
  },

  numSymbolUsed: function(sym) {
    return this.fetchCount(this._symbolUsage, sym);
  },

  symbolUsed: function(sym) {
    this.incrementCount(this._symbolUsage, sym);
  },

  fetchCount: function(m, key) {
    var n = m.get(key); // Number
    if (n == null) {
      return 0;
    } else {
      return n;
    }
  },

  incrementCount: function(m, key) {
    m.set(key, this.fetchCount(m, key) + 1);
  }  
};
