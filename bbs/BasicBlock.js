var $extend = require('../util/extend');
var $import = require('../util/import');
module.exports = BasicBlock;

function BasicBlock() {
  this._insts = []; // IR.Stmt[]
}

BasicBlock.prototype = {
  insts: function() {
    return this._insts;
  },

  insertBefore: function(j, inst) {
    if (j < 0) j = 0;
    if (j >= this._insts.length) j = this._insts.length-1;

    this._insts.length++;
    for (var i = this._insts.length-1; i >= j; i--) {
      this._insts[i+1] = this._insts[i];
    }
    this._insts[j] = inst;
  },

  insertAfter: function(j, inst) {
    if (j < 0) j = 0;
    if (j >= this._insts.length) j = this._insts.length-1;
    if (j === this._insts.length-1) j--;

    for (var i = this._insts.length-1; i > j; i--) {
      this._insts[i+1] = this._insts[i];
    }
    this._insts[j+1] = inst;
  },

  append: function(inst) {
    this.insertAfter(this._insts.length-1, inst);
  },

  deleteInst: function(j, inst) {
    if (j < 0) j = 0;
    if (j >= this._insts.length) j = this._insts.length-1;

    for (var i = j; i < this._insts.length; i++) {
      this._insts[i] = this._insts[i+1];
    }
    this._insts.length--;
  }
};
