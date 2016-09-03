var $extend = require('../util/extend');
var $import = require('../util/import');
var BasicBlock = require('./BasicBlock');
var LabelStmt = require('../ir/LabelStmt');
var Jump = require('../ir/Jump');
var CJump = require('../ir/CJump');
var Return = require('../ir/Return');
module.exports = BBS;

function BBS() {
  this._bbs = []; // BasicBlock[]
  this._succ = new Map(); // Number -> Number Set
  this._pred = new Map(); // Number -> Number Set
  this._labelMap = new Map(); // String -> Number
  this._entryBlock = new BasicBlock();
  this._exitBlock = new BasicBlock();
  this._bbs.push(this._entryBlock); // extra block
  this._bbs.push(this._exitBlock);  // extra block
  this._entryIndex = 0;
  this._exitIndex  = 1;
  var tmpSet = new Set();
  tmpSet.add(2);
  this._succ.set(this._entryIndex, tmpSet);
}

BBS.prototype = {
  build: function(stmts) {
    var curBlock = new BasicBlock();
    for (var stmt of stmts) {
      if (stmt instanceof LabelStmt && curBlock.length() > 0) {
        this._bbs.push(curBlock);
        curBlock = new BasicBlock();
      }
      curBlock._insts.push(stmt);
    }
    this._bbs.push(curBlock);
    this.resolveLabelMap();
    this.resolveSuccAndPred();
    this.removeIsolatedBlock();
  },

  resolveLabelMap: function() {
    var bb;
    for (var i = 0; i < this._bbs.length; i++) {
      bb = this._bbs[i];
      if (bb.inst(0) instanceof LabelStmt) {
        this._labelMap.set(bb.inst(0).label().toString(), i);
      }
    }
  },

  resolveSuccAndPred: function() {
    var bb;
    var inst;
    var lastInst;
    for (var i = 0; i < this._bbs.length; i++) {
      bb = this._bbs[i];
      for (var j = 0; j < bb.length(); j++) {
        var inst = bb.inst(j);
        if (inst instanceof Return) {
          bb.resize(j+1);
          break;
        }
      }
      lastInst = bb.inst(bb.length()-1);
      if (lastInst instanceof Jump) {
        this.addSucc(i, this._labelMap.get(lastInst.label().toString()));
        this.addPred(this._labelMap.get(lastInst.label().toString()), i);
      } else if (lastInst instanceof CJump) {
        this.addSucc(i, this._labelMap.get(lastInst.thenLabel().toString()));
        this.addPred(this._labelMap.get(lastInst.thenLabel().toString()), i);
        this.addSucc(i, this._labelMap.get(lastInst.elseLabel().toString()));
        this.addPred(this._labelMap.get(lastInst.elseLabel().toString()), i);
      } else if (lastInst instanceof Return) {
        this.addSucc(i, this._exitIndex);
        this.addPred(this._exitIndex, i);
      }
    }
  },

  addSucc: function(i, j) {
    this._add(this._succ, i, j);
  },

  removeSucc: function(i, j) {
    this._remove(this._succ, i, j);
  },

  addPred: function(i, j) {
    this._add(this._pred, i, j);
  },

  removePred: function(i, j) {
    this._remove(this._pred, i, j);
  },

  _add: function(m, i, j) {
    var s;
    if (m.has(i)) {
      s = m.get(i);
      s.add(j);
    } else {
      s = new Set()
      s.add(j);
      m.set(i, s);
    }
  },

  _remove: function(m, i, j) {
    var s;
    if (m.has(i)) {
      s = m.get(i);
      s.delete(j);
    } else {
      throw new Error('#_remove error');
    }
  },

  // i -> j | i   j
  insertBlock: function(i, j, block) {
    this._bbs.push(block);
    var blockIndex = this._bbs.length;
    this.addSucc(i, blockIndex);
    this.removeSucc(i, j);
    this.addPred(j, blockIndex)
    this.removePred(j, i);
    this.addSucc(blockIndex, j);
    this.addPred(blockIndex, i);
  },

  deleteBlock: function(i) {
    if (this.succ(i).has(i)) {
      this.removePred(i, i);
      this.removeSucc(i, i);
    }
    var predSet = this.cloneSet(this.pred(i));
    var succSet = this.cloneSet(this.succ(i));

    for (var j of predSet) {
      // Succ(j) = (Succ(j) - {i}) U Succ(i)
      this.removeSucc(j, i);
      for (var k of succSet) {
        this.addSucc(j, k);
      }
    }
    for (var j of succSet) {
      // Pred(j) = (Pred(j) - {i}) U Pred(i)
      this.removePred(j, i);
      for (var k of predSet) {
        this.addPred(j, k);
      }
    }

    // delete block
    for (var j = i; j < this._bbs.length-1; j++) {
      this._bbs[j] = this._bbs[j+1];
      this._succ.set(j, this.succ(j+1));
      this._pred.set(j, this.pred(j+1));
    }
    this._succ.delete(this._bbs.length-1);
    this._pred.delete(this._bbs.length-1);
    this._bbs.length--;

    // // adjust data structures
    for (var j = 0; j < this._bbs.length; j++) {
      succSet = this.cloneSet(this.succ(j));
      for (var k of succSet) {
        if (k > i) {
          // Succ(j) = (Succ(j) - {k}) U {k-1}
          this.removeSucc(j, k);
          this.addSucc(j, k-1);
        }
      }
      predSet = this.cloneSet(this.pred(j));
      for (var k of predSet) {
        if (k > i) {
          // Pred(j) = (Pred(j) - {k}) U {k-1}
          this.removePred(j, k);
          this.addPred(j, k-1);
        }
      }
    }
  },

  removeIsolatedBlock: function() {
    var newBBS = [];
    for (var i = 0; i < this._bbs.length; i++) {
      if (this.succ(i).size === 0 && this.pred(i).size === 0) {
        this._succ.delete(i);
        this._pred.delete(i);
      } else {
        newBBS.push(i);
      }
    }
    this._bbs = newBBS;
  },

  succ: function(i) {
    if (this._succ.has(i)) {
      return this._succ.get(i);
    } else {
      var tmpSet = new Set();
      this._succ.set(i, tmpSet);
      return tmpSet;
    }
  },

  pred: function(i) {
    if (this._pred.has(i)) {
      return this._pred.get(i);
    } else {
      var tmpSet = new Set();
      this._pred.set(i, tmpSet);
      return tmpSet;
    }
  },

  block: function(i) {
    return this._bbs[i];
  },

  blocks: function() {
    return this._bbs;
  },

  cloneSet: function(s) {
    var tmpSet = new Set();
    for (var v of s) {
      tmpSet.add(v);
    }
    return tmpSet;
  }
};
