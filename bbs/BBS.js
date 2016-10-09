var $extend = require('../util/extend');
var $import = require('../util/import');
var SetOp   = require('../util/SetOp');
var BasicBlock = require('./BasicBlock');
var LabelStmt = require('../ir/LabelStmt');
var Jump = require('../ir/Jump');
var CJump = require('../ir/CJump');
var Return = require('../ir/Return');
var Switch = require('../ir/Switch');
module.exports = BBS;

function BBS() {
  this._bbs = []; // BasicBlock[]
  this._succ = new Map(); // Number -> {Number}
  this._pred = new Map(); // Number -> {Number}
  this._allEbbs = new Map();  // Number -> {Number}
  this._allDoms = new Map();  // Number -> {Number}
  this._addIDoms = new Map(); // Number -> Number
  this._labelMap = new Map(); // String -> Number
  this._naturalLoop = new Map() // Number -> {Number}   // header -> loop
  this._entryBlock = new BasicBlock();
  this._exitBlock = new BasicBlock();
  this._bbs.push(this._entryBlock); // extra block
  this._bbs.push(this._exitBlock);  // extra block
  this._entryIndex = 0;
  this._exitIndex  = 1;
  var tmpSet;
  tmpSet = new Set(); tmpSet.add(2);
  this._succ.set(this._entryIndex, tmpSet);
  tmpSet = new Set(); tmpSet.add(0);
  this._pred.set(2, tmpSet);
}

BBS.prototype = {
  build: function(stmts) {
    stmts.push(new Return(null, null)); // dummy Return to avoid no return
    var curBlock = new BasicBlock();
    for (var stmt of stmts) {
      if (stmt instanceof LabelStmt && curBlock.length() > 0) {
        this._bbs.push(curBlock);
        curBlock = new BasicBlock();
      }
      curBlock._insts.push(stmt);
    }
    this._bbs.push(curBlock);
    this.resolveSuccAndPred();
    this.removeIsolatedBlock();
    this.compactBlock();
    this._allEbbs  = this.buildAllEbbs();
    this._allDoms  = this.buildAllDoms();
    this._addIDoms = this.buildAllIDoms();
    this._naturalLoop = this.buildNaturalLoop();
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
    this.resolveLabelMap();
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
        } else if (inst instanceof Jump) {
          // multi break statement will cause this case
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
      } else if (lastInst instanceof Switch) {
        this.addSucc(i, this._labelMap.get(lastInst.defaultLabel().toString()));
        this.addPred(this._labelMap.get(lastInst.defaultLabel().toString()), i);
        var cases = lastInst.cases();
        for (var c of cases) {
          this.addSucc(i, this._labelMap.get(c.label().toString()));
          this.addPred(this._labelMap.get(c.label().toString()), i);
        }
      }
    }
    this._labelMap = null; // don't need anymore
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
    var predSet = SetOp.cloneSet(this.pred(i));
    var succSet = SetOp.cloneSet(this.succ(i));

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
      succSet = SetOp.cloneSet(this.succ(j));
      for (var k of succSet) {
        if (k > i) {
          // Succ(j) = (Succ(j) - {k}) U {k-1}
          this.removeSucc(j, k);
          this.addSucc(j, k-1);
        }
      }
      predSet = SetOp.cloneSet(this.pred(j));
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
    var visit = []; // Number[]
    var queue = []; // Number[]
    var curIndex;   // Number
    var succSet;    // Number Set
    for (var i = 0; i < this._bbs.length; i++) {
      visit.push(false);
    }
    // BFS
    queue.push(this._entryIndex);
    while(queue.length !== 0) {
      curIndex = queue.pop();
      visit[curIndex] = true;
      succSet = this.succ(curIndex);
      for (var i of succSet) {
        if (!visit[i]) queue.push(i);
      }
    }
    // reverse because deleteBlock will move the this._bbs
    for (var i = visit.length-1; i >= 0 ; i--) {
      if (!visit[i]) {
        this.deleteBlock(i);
      }
    }
  },

  entryIndex: function() {
    return this._entryIndex;
  },

  exitIndex: function() {
    return this._exitIndex;
  },

  isEntryIndex: function(i) {
    return i === this._entryIndex;
  },

  isExitIndex: function(i) {
    return i === this._exitIndex;
  },

  /**
   *  three patterns:
   *
   *   |     |    \|/
   *  [ ]   [ ]   [ ] 
   *  0|1  2/|\n  0|1
   */
  
  pattern1: function(i) {
    return this.pred(i).size === 1 && this.succ(i).size <= 1;
  },

  pattern2: function(i) {
    return this.pred(i).size === 1 && this.succ(i).size > 1;
  },

  pattern3: function(i) {
    return this.pred(i).size > 1 && this.succ(i).size <= 1;
  },

  compactBlock: function() {
    var workList = [];
    var visit = [];
    var curIndex;      // Number
    var succSet        // Number Set
    // actually only one blockIndex will be pushed
    // entry block should not be compact
    for (var i of this.succ(this._entryIndex)) {
      workList.push(i); // i should be 2
      visit[i] = true;
    }

    while (workList.length !== 0) {
      curIndex = workList.shift();
      visit[curIndex] = true;
      succSet = this.succ(curIndex);
      if (this.pattern1(curIndex) || this.pattern3(curIndex)) {
        for (var i of succSet) { // 0 or 1 iterate
          if (i === curIndex) continue;
          if ((this.pattern1(i) || this.pattern2(i))
              && !this.isExitIndex(i)) {
            this._compactTwoBlock(curIndex, i);
            // ----- adjust index --------------------------
            workList.map(function(v){return v<i?v:v-1 });
            curIndex = curIndex < i ? curIndex: curIndex - 1;
            // ---------------------------------------------
            for (var j = i; j < visit.length-1; j++) visit[i] = visit[i+1];
            visit.pop();
            visit[curIndex] = false;
            if (!visit[i]) workList.push(curIndex);
            var tmpSet = this.succ(curIndex);
            for (var k of tmpSet) visit[k] = true;
            break;
          } else {
            if (!visit[i]) workList.push(i);
          }
        }
      } else {
        for (var i of succSet) {
          if (!visit[i]) workList.push(i);
        }
      }
    }
  },

  _compactTwoBlock(i, j) {
    // console.log('compact',i,j)
    var firstBlock = this.block(i);
    var secondBlock = this.block(j);
    firstBlock.deleteInst(firstBlock.length()-1);
    secondBlock.deleteInst(0); 
    firstBlock.appendInsts(secondBlock.insts());
    this.deleteBlock(j);
  },

  /**
   * @return {Object} // Number -> {Number}
   */
  
  buildAllEbbs: function() {
    var succSet = this.succ(this._entryIndex);
    var predSet = this.pred(this._entryIndex);
    var ebbRoots = [this._entryIndex];
    var cur;
    var result = new Map; 
    while (ebbRoots.length !== 0) {
      cur = ebbRoots.pop();
      if (!result.has(cur)) {
        result.set(cur, this.buildEbb(cur, ebbRoots));
      }
    }
    return result
  },

  buildEbb: function(r, ebbRoots) {
    var Ebb = new Set();
    this.addBbs(r, Ebb, ebbRoots);
    return Ebb;
  },

  /**
   * @param  {Number} r
   * @param  {Object} Ebb // {Number}
   * @param  {Object} ebbRoots // Number[]
   * @return {Object} // {Number}
   */

  addBbs: function(r, Ebb, ebbRoots) {
    var succSet = this.succ(r);
    var predSet = this.pred(r);
    Ebb.add(r);
    for (var x of succSet) {
      if (this.pred(x).size === 1 && !Ebb.has(x)) {
        this.addBbs(x, Ebb, ebbRoots);
      } else if (ebbRoots.indexOf(x) === -1) {
        ebbRoots.push(x);
      }
    }
  },

  /**
   * @brief {return depthFirst order basic block index array}
   */
  
  depthFirstSeq: function() {
    var seq = [];
    var visit = [];
    this._depthFirstSeq(this._entryIndex, seq, visit);
    return seq;
  },

  _depthFirstSeq: function(index ,seq, visit) {
    seq.push(index);
    visit[index] = true;
    for (var s of this.succ(index)) {
      if (!visit[s]) this._depthFirstSeq(s, seq, visit);
    }
  },

  /**
   * compute dominate relation
   * @return {Object} // Number -> {Number}
   */
  
  buildAllDoms: function() {
    var allDoms = new Map(); // Number -> {Number}
    var change = true;
    var entryIndex = this._entryIndex;
    // init
    allDoms.set(entryIndex, (new Set).add(entryIndex));
    // seq: depth First order without entryIndex
    var seq = this.depthFirstSeq().filter(function(v){return v !== entryIndex});
    var wholeSet = this.wholeIndexSet();

    for (var i of seq) {
      allDoms.set(i, SetOp.cloneSet(wholeSet));
    }
    // iterate
    var counter = 0;
    while (change) {
      change = false;
      for (var cur of seq) {
        var tmpSet = SetOp.cloneSet(wholeSet);
        for (var p of this.pred(cur)) {
          tmpSet = SetOp.interset(tmpSet, allDoms.get(p));
        }
        tmpSet.add(cur);
        if (!SetOp.equal(tmpSet, allDoms.get(cur))) {
          change = true;
          allDoms.set(cur, tmpSet);
        }

      }
    }
    return allDoms;
  },

  /**
   * compute immediate dominate relation
   * @return {Object} // Number -> Number
   */

  buildAllIDoms: function() {
    var allIDoms = new Map(); // Number -> Number
    var change = true;
    var entryIndex = this._entryIndex;
    var tmpMap = new Map();
    var tmpSet;
    // init
    for (var i = 0; i < this._bbs.length; i++) {
      tmpSet = this._allDoms.get(i);
      tmpSet.delete(i);
      tmpMap.set(i, tmpSet);
    }
    // seq: depth First order without entryIndex
    var seq = this.depthFirstSeq().filter(function(v){return v !== entryIndex});
    var wholeSet = this.wholeIndexSet();
    for (var cur of seq) {
      var tmpSet1 = SetOp.cloneSet(tmpMap.get(cur));
      for (var s of tmpSet1) {
        var tmpSet2 = SetOp.minus(tmpMap.get(cur), (new Set).add(s));
        for (var t of tmpSet2) {
          if (tmpMap.get(s).has(t)) {
            tmpMap.get(cur).delete(t);
          }
        }
      }
    }
    for (var i of seq) {
      tmpSet = tmpMap.get(i);
      if (tmpSet.size !== 1) throw new Error('#buildAllIDoms bug');
      for (var j of tmpSet) { 
        // tmpSet.get(seq) only has 1 item
        allIDoms.set(i, j);
      }
    }
    return allIDoms;
  },

  buildNaturalLoop: function() {
    // String := 'from,to' -> type := tree | back | forward | cross | null
    var allEdges = this.getAllEdges();     
    var treeEdges = new Set;    // {<from, to>}
    var backEdges = new Set;    // {<from, to>} 
    var forwardEdges = new Set; // {<from, to>}
    var crossEdges = new Set;   // {<from, to>}
    this.markallEdgesType(allEdges);
    console.log(allEdges);
  },

  markallEdgesType: function(allEdges) {
    var visit = [];// [Number]
    var pre = [];  // [Number] 
    var post = []; // [Number]
    var len = this.blocks().length
    for (var i = 0; i < len; i++) {
      pre.push(0);
      post.push(0);
      visit.push(false);
    }
    pre.index = 1;
    post.index = 1;
    this._markallEdgesType(allEdges, visit, pre, post, this.entryIndex());
    // console.log(allEdges);
  },

  _markallEdgesType: function(allEdges, visit, pre, post, from) {
    visit[from] = true;
    pre[from] = pre.index++;
    for (var to of this.succ(from)) {
      if (!visit[to]) {
        this._markallEdgesType(allEdges, visit, pre, post, to);
        allEdges.set(this.encodeAllEdgesKey(from, to), 'tree');
      } else if (pre[from] < pre[to]) {
        allEdges.set(this.encodeAllEdgesKey(from, to), 'forward');
      } else if (post[to] === 0) { // to hasn't been visit now , when post[y] equal 0
        allEdges.set(this.encodeAllEdgesKey(from, to), 'back');
      } else {
        allEdges.set(this.encodeAllEdgesKey(from, to), 'cross');
      }
    }
    post[from] = post.index++;
  },

  getAllEdges: function() {
    // String := 'from,to' -> type := tree | back | forward | cross | null
    var allEdges = new Map;
    var succMap = this._succ;
    for (var from of succMap.keys()) {
      var toSet = succMap.get(from);
      for (var to of toSet) {
        allEdges.set(this.encodeAllEdgesKey(from, to), null);
      }
    }
    return allEdges;
  },

  encodeAllEdgesKey: function(from, to) {
    return from + ',' + to;
  },

  decodeAllEdgesKey: function(key) {
    var commaIndex = key.indexOf(',');
    if (commaIndex === -1) {
      throw new Error('parseAllEdgesKey Error!');
    }
    var from = parseInt(key.slice(0, commaIndex));
    var to = parseInt(key.slice(commaIndex+1, key.length));
    return {from: from, to: to};
  },

  wholeIndexSet: function() {
    var wholeSet = new Set;
    for (var i = 0; i < this._bbs.length; i++) {
      wholeSet.add(i);
    }
    return wholeSet;
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
  }
};
