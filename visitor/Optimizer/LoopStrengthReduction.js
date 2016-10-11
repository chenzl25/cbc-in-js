var $extend = require('../../util/extend');
var $import = require('../../util/import');
var SetOp = require('../../util/SetOp');
var Op = require('../../ir/Op');
var ir = require('../../ir/index');
var INT32 = require('../../asm/Type').INT32;
var PointerRelated = require('../../visitor/Collector/PointerRelated');
module.exports = LoopStrengthReduction;

function LoopStrengthReduction() {

}

LoopStrengthReduction.prototype = {
  optimize: function(ir) {
    if ((new PointerRelated()).collect(ir)) {
      return;
    }
    this.srDefinedFunctions(ir.definedFunctions());
  },

  srDefinedFunctions: function(defuns) {
    for (var f of defuns) {
      this.srDefinedFunction(f.bbs());
    }
  },

  srDefinedFunction: function(bbs) {
    var bset; // Set {Number}
    var backEdge; // {x, y}
    var IVs;  // Set {IVRecord}
    var insts, inst; 
    var SRdone = [];

    for (var key of bbs._naturalLoop.keys()) {
      bset = bbs._naturalLoop.get(key);
      backEdge = this.decodeEdgeKey(key);
      IVs = this.findIVS(bbs, backEdge, bset);

      // init SRdone
      for (var i = 0; i < bbs.blocks().length; i++) {
        var arr = [];
        for (var j = 0; j < bbs.block(i).length(); j++) {
          arr.push(false);
        }
        SRdone.push(arr);
      }

      // search for uses of induction variables
      for (var iv1 of IVs) {
        if (!(iv1.fctr === 1 && iv1.diff === 0) && iv1.biv === iv1.tiv) {
          for (var iv2 of IVs) {
            if (!iv2.equal(iv1) && iv2.biv === iv1.biv && iv2.tiv !== iv2.biv) {
              var tj = ir.Reg.tmp();
              var db = ir.Reg.tmp();
              if (SRdone[iv2.blk][iv2.pos]) {
                continue;
              }
              SRdone[iv2.blk][iv2.pos] = true;
              // and split their computation between preheader and
              // this use, replacing operations by less expensive ones
              var preheader = bbs.block(bbs._preheader.get(backEdge.to));
              preheader.appendInst(new ir.Move(null, 
                                    new ir.Bin(null, Op.MUL, 
                                      new ir.Int(INT32, iv1.diff), 
                                      new ir.Int(INT32, iv2.fctr)), 
                                    db));

              preheader.appendInst(new ir.Move(null, 
                                    new ir.Bin(null, Op.MUL, 
                                      new ir.Int(INT32, iv2.fctr), 
                                      new ir.Reg(iv2.biv)), 
                                    tj));

              preheader.appendInst(new ir.Move(null, 
                                    new ir.Bin(null, Op.ADD, 
                                      new ir.Int(INT32, iv2.diff), 
                                      new ir.Reg(tj.name())), 
                                    new ir.Reg(tj.name())));

              // We just let iv2.tiv = tj
              bbs.block(iv2.blk).inst(iv2.pos)._from = new ir.Reg(tj.name());

              for (var iv of IVs) {
                if (iv.blk === iv1.blk && iv.pos > iv1.pos) {
                  iv.pos++;
                }
              }
              bbs.block(iv1.blk).insertAfter(iv1.pos, new ir.Move(null, 
                                            new ir.Bin(null, Op.ADD, 
                                              new ir.Reg(tj.name()), 
                                              new ir.Reg(db.name())), 
                                            new ir.Reg(tj.name())));

              // To make algorithm simple, We don't add new IVs.
              // IVs.add(new IVRecord(tj.name(), iv2.biv, iv1.blk, iv1.pos+1, iv2.fctr, iv2.diff));
            }
          }
        }
      } // end of search and split
    } // end of naturalLoop
  },

  findIVS: function(bbs, backEdge, bset) {
    var IVs = new Set; // { IVRecord }
    var iv; // IVRecord
    var change = false;
    var insts, inst;
    for (var i of bset) {
      insts = bbs.block(i).insts();
      for (var j = 0; j < insts.length; j++) {
        inst = insts[j];
        // search for instructions that compute fundamental induction
        // variables and accumulate information about them in IVs
        if (inst instanceof ir.Move && 
            inst.from() instanceof ir.Bin &&
            inst.to() instanceof ir.Reg &&
            this.ivPattern(inst, bbs, backEdge, bset, IVs)) {
          // TO Improve: make IVRecord support minus like i = i - 1
          IVs.add(new IVRecord(inst.to().name(), inst.to().name(), i, j, 1, 0));
        }
      }
    }

    do {
      change = false;
      for (var i of bset) {
        insts = bbs.block(i).insts();
        for (var j = 0; j < insts.length; j++) {
          inst = insts[j];
          // check for dependent induction variables
          // and accumulate information in the IVs structure
          if (inst instanceof ir.Move && 
              inst.from() instanceof ir.Bin &&
              inst.to() instanceof ir.Reg) {
            change = this.mulIV(i, j, inst, bbs, backEdge, bset, IVs) || 
                     this.addIV(i, j, inst, bbs, backEdge, bset, IVs);
          }
        }
      }
    } while(change)
    return IVs;
  },

  ivPattern: function(inst, bbs, backEdge, bset, IVs) {
    // inst:  a <- b + c
    return this.subIvPattern(inst, inst.from().left(), inst.from().right(), 
                             bbs, backEdge, bset, IVs) 
           ||
           this.subIvPattern(inst, inst.from().right(), inst.from().left(), 
                             bbs, backEdge, bset, IVs);
  },

  subIvPattern: function(inst, opd1, opd2, bbs, backEdge, bset, IVs) {
    if (opd1 instanceof ir.Reg &&
        inst.to().name() == opd1.name() &&
        inst.from().op() == Op.ADD &&
        this.loopConst(opd2, bbs, backEdge, bset)) {
      for (var iv of IVs)
        if (iv.tiv === inst.to().name()) 
          return false;
      return true;
    } else {
      return false;
    }
  },

  mulIV: function(i, j, inst, bbs, backEdge, bset, IVs) {
    return this.subMulIV(i, j, inst, inst.from().left(), inst.from().right(), 
                         bbs, backEdge, bset, IVs)
           ||
           this.subMulIV(i, j, inst, inst.from().right(), inst.from().left(), 
                         bbs, backEdge, bset, IVs);
  },

  subMulIV: function(i, j, inst, opd1, opd2, bbs, backEdge, bset, IVs) {
    if (this.loopConst(opd1, bbs, backEdge, bset) && inst.from().op() === Op.MUL) {
      for (var iv of IVs) {
        if (opd2.name() === iv.tiv && 
            iv.tiv === iv.biv && 
            iv.fctr === 1 &&
            iv.diff === 0) {
          IVs.add(new IVRecord(inst.to().name(), iv.biv, i, j, opd1.value(), 0));
        } else {
          // TODO
        }
      }
    }
  },

  addIV: function(i, j, inst, bbs, backEdge, bset, IVs) {
    return this.subAddIV(i, j, inst, inst.from().left(), inst.from().right(), 
                         bbs, backEdge, bset, IVs)
           ||
           this.subAddIV(i, j, inst, inst.from().right(), inst.from().left(), 
                         bbs, backEdge, bset, IVs);
  },

  subAddIV: function(i, j, inst, opd1, opd2, bbs, backEdge, bset, IVs) {
    if (this.loopConst(opd1, bbs, backEdge, bset) && inst.from().op() === Op.ADD) {
      for (var iv of IVs) {
        if (opd2.name() === iv.tiv && 
            iv.tiv === iv.biv && 
            iv.fctr === 1 &&
            iv.diff === 0) {
          IVs.add(new IVRecord(inst.to().name(), iv.biv, i, j, 1, opd1.value()));
        } else {
          // TODO
        }
      }
    }
  },

  loopConst: function(opd, bbs, backEdge, bset) {
    if (opd instanceof ir.Int) {
      return true;
    } else {
      // TODO other constant variable in bset
    }
  },

  decodeEdgeKey: function(key) {
    var commaIndex = key.indexOf(',');
    if (commaIndex === -1) {
      throw new Error('parseAllEdgesKey Error!');
    }
    var from = parseInt(key.slice(0, commaIndex));
    var to = parseInt(key.slice(commaIndex+1, key.length));
    return {from: from, to: to};
  }
};

function IVRecord (tiv_, biv_, blk_, pos_, fctr_, diff_) {
  this.tiv = tiv_;    // String
  this.biv = biv_;    // String
  this.blk = blk_;    // Number
  this.pos = pos_;    // Number
  this.fctr = fctr_;  // Number
  this.diff = diff_;  // Number
}

IVRecord.prototype.equal = function(r) {
  return  this.tiv === r.tiv &&
          this.biv === r.biv &&
          this.blk === r.blk &&
          this.pos === r.pos &&
          this.fctr === r.fctr &&
          this.diff === r.diff;
}