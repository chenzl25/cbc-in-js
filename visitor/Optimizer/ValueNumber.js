var $extend = require('../../util/extend');
var $import = require('../../util/import');
var ir = require('../../ir/index');
module.exports = ValueNumber;

function ValueNumber() {
  this._maxHash = 10;
}

ValueNumber.prototype = {
  optimize: function(ir) {
    this.numberDefinedFunctions(ir.definedFunctions());
  },

  numberDefinedFunctions: function(defuns) {
    for (var f of defuns) {
      this.numberDefinedFunction(f.bbs());
    }
  },

  numberDefinedFunction: function(bbs) {
    for (var i = 0; i < bbs._bbs.length; i++) {
      this.numberLocal(bbs, bbs._bbs[i]);
    }
  },

  numberLocal: function(bbs, bb) {
    var maxhash = 100;
    var hashSeq = [];
    for (var i = 0; i < this._maxHash; i++) {
      hashSeq.push([]);
    }
    for (var i = 0; i < bb._insts.length; i++) {
      if (bb._insts[i] instanceof ir.Move) {
        if (bb._insts[i].from() instanceof ir.Bin) {
          var bin = bb._insts[i].from();
          var h = this.hash(bin.op(), bin.left(), bin.right());
          this.processInst(bbs, bb, hashSeq, i, h);
        } else if (bb._insts[i].from() instanceof ir.Uni) {
          var uni = bb._insts[i].from();
          var h = this.hash(uni.op(), uni.expr());
          this.processInst(bbs, bb, hashSeq, i, h);
        } else {
          var h = this.hash(bb._insts[i].from());
          this.processInst(bbs, bb, hashSeq, i, h); 
        }
      }
    }
  },

  processInst: function(bbs, bb, hashSeq, instIndex, hashValue) {
    var inst1 = bb.inst(instIndex);
    var doit = true; // do not match
    for (var j = 0; j < hashSeq[hashValue].length; j++) {
      var inst2 = bb.inst(hashSeq[hashValue][j]);
      if (this.matchExp(inst1, inst2)) {
        doit = false;
        bb.inst(instIndex)._from = inst2.to();
        break;
      }
    }
    this.remove(bbs, bb, hashSeq, inst1.to().name());
    if (doit && (inst1.from() instanceof ir.Bin || 
                 inst1.from() instanceof ir.Uni)) {
      hashSeq[hashValue].unshift(instIndex);
    }
  },

  matchExp: function(inst1, inst2) {
    if (inst1.from() instanceof ir.Bin && inst2.from() instanceof ir.Bin) {
      if (inst1.from().op() === inst2.from().op()) {
        if (this.sameExpr(inst1.from().left(), inst2.from().left()) &&
            this.sameExpr(inst1.from().right(), inst2.from().right()))
            return true;
        if (ir.Op.isComm(inst1.from().op()) &&
            this.sameExpr(inst1.from().left(), inst2.from().right()) &&
            this.sameExpr(inst1.from().right(), inst2.from().left()))
            return true;
      }
    } else if (inst1.from() instanceof ir.Uni && inst2.from() instanceof ir.Uni) {
      if (inst1.from().op() === inst2.from().op() &&
          this.sameExpr(inst1.from().expr(),inst2.from().expr())) {
          return true;
      }
    }
    return false;
  },

  remove: function(bbs, bb, hashSeq, name) {
    for (var i = 0; i < hashSeq.length; i++) {
      for (var j = 0; j < hashSeq[i].length;) {
        if (bb.inst(hashSeq[i][j]).from() instanceof ir.Bin &&
            ((bb.inst(hashSeq[i][j]).from().left() instanceof ir.Reg &&
              bb.inst(hashSeq[i][j]).from().left().name() === name) ||
             (bb.inst(hashSeq[i][j]).from().right() instanceof ir.Reg &&
              bb.inst(hashSeq[i][j]).from().right().name() === name))) {
          hashSeq[i].splice(j);
        } else if (bb.inst(hashSeq[i][j]).from() instanceof ir.Uni &&
                   bb.inst(hashSeq[i][j]).from().expr().name() === name) {
          hashSeq[i].splice(j);
        } else {
          j++;
        }
      }
    }
  },

  // only for Int and Reg
  sameExpr: function(e1, e2) {
    if (e1 instanceof ir.Reg && e2 instanceof ir.Reg) {
      return e1.name() === e2.name();
    } else if (e1 instanceof ir.Int && e2 instanceof ir.Int) {
      return e1.value() == e2.value();
    } else {
      return false;
    }
  },

  hash: function(one, two, three) {
    var str =  ''
    if (one) str += one.toString();
    if (two) str += two.toString();
    if (three) str += three.toString();
    return this.hashStr(str) % this._maxHash;
  },

  hashStr: function(str) {
    var result = 0;
    for (var i = 0; i < str.length && i < 20; i++) {
      result += str.charCodeAt(i);
    }
    return result;
  }
};
