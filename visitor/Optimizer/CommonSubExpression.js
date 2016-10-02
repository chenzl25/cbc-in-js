var $extend = require('../../util/extend');
var $import = require('../../util/import');
var SetOp = require('../../util/SetOp');
var Op = require('../../ir/Op');
var ir = require('../../ir/index');
var INT32 = require('../../asm/Type').INT32;
var PointerRelated = require('../../visitor/Collector/PointerRelated');
module.exports = CommonSubExpression;

function CommonSubExpression() {

}

CommonSubExpression.prototype = {
  optimize: function(ir) {
    if ((new PointerRelated()).collect(ir)) {
      return;
    }
    this.cseDefinedFunctions(ir.definedFunctions());
  },

  cseDefinedFunctions: function(defuns) {
    for (var f of defuns) {
      this.cseDefinedFunction(f.bbs());
    }
  },

  cseDefinedFunction: function(bbs) {
    var EVAL = [];
    for (var i = 0; i < bbs._bbs.length; i++) {
      var AEB = this.cseLocal(bbs.block(i), i);
      EVAL.push(this.cloneSet(AEB));
    }
    this.cseGlobal(bbs, EVAL);
  },

  cseLocal: function (block, blockIndex) {
    var AEB = new Set; // Set {<pos, opd1, opr, opd2, tmp>}
    for (var i = 0; i < block.length(); i++) {
      var inst = block.inst(i);
      var found = false;
      if (inst instanceof ir.Move && 
          inst.from() instanceof ir.Bin &&
          (inst.from().left() instanceof ir.Reg || inst.from().left() instanceof ir.Int) && 
          (inst.from().right() instanceof ir.Reg || inst.from().right() instanceof ir.Int) &&
          inst.to() instanceof ir.Reg) {
        // oprand of Bin shoule be Int or Reg
        for (var aeb of AEB) {
          // match current instruction's expression against those 
          // in AEB. including commutativity
          if (inst.from().op() === aeb.opr &&
              ((this.opdValueEqual(this.opdValue(inst.from().left()), aeb.opd1) && 
                this.opdValueEqual(this.opdValue(inst.from().right()), aeb.opd2)) ||
               (ir.Op.isComm(inst.from().op()) &&
                this.opdValueEqual(this.opdValue(inst.from().right()), aeb.opd1) && 
                this.opdValueEqual(this.opdValue(inst.from().left()), aeb.opd2)))) {
            var pos = aeb.pos;
            found = true;
            // if no variable in tuple, create a new temporary and
            // insert an instruction evaluating the expression
            // and assigning it to the temporary
            var tName;
            if (aeb.tmp === null) {
              var ti = ir.Reg.tmp();
              AEB.delete(aeb);
              AEB.add({blk: blockIndex,
                       pos: aeb.pos, 
                       opd1: aeb.opd1,
                       opr:  aeb.opr,
                       opd2: aeb.opd2,
                       tmp: ti.name()});
              block.insertBefore(pos, 
                new ir.Move(null,
                            new ir.Bin(INT32, aeb.opr, 
                              new ir.Reg(aeb.opd1), new ir.Reg(aeb.opd2)),
                            ti));
              this.reNumber(AEB, pos);
              pos += 1;
              i += 1;
              // replace instruction at position pos by one that copies the temporary
              tName = ti.name();
              block._insts[pos]._from = new ir.Reg(tName);
            } else {
              tName = aeb.tmp;
            }
            // replace current instruction by one that copies the temporary ti
            block._insts[i]._from = new ir.Reg(tName);
            break;
          }
        }
        if (!found) {
          AEB.add({blk: blockIndex,
                   pos: i, 
                   opd1: this.opdValue(inst.from().left()),
                   opr:  inst.from().op(),
                   opd2: this.opdValue(inst.from().right()),
                   tmp: null})
        }
        for (var aeb of AEB) {
          if (this.opdValueEqual(aeb.opd1, this.opdValue(inst.to())) || 
              this.opdValueEqual(aeb.opd2, this.opdValue(inst.to()))) {
            AEB.delete(aeb);
          }
        }
      } else {
        // TODO: add more elsif case to detect pointer related operation
      }
    }
    return AEB;
  },

  opdValueEqual: function(v1, v2) {
    if (typeof v1 === 'string' && typeof v2 === 'string') {
      return v1 === v2;
    } else if (typeof v1 === 'number' && typeof v2 === 'number') {
      return v1 === v2;
    } else {
      return false;
    }
  },

  opdValue: function(opd) {
    if (opd instanceof ir.Reg) {
      return opd.name();
    } else if (opd instanceof ir.Int) {
      return opd.value();
    } else {
      throw new Error('opdValue Error');
    }
  },

  reNumber: function(AEB, pos) {
    for (var aeb of AEB) {
      if (aeb.pos >= pos) {
        aeb.pos++;
      }
    }
  },

  cseGlobal: function(bbs, EVAL) {
    // EVAL, KILL [Set {<blk, pos, opd1, opr, opd2>}]
    // AEin(i) = interset(AEout(j)) j ∈ Pred(i)
    // AEout(i) = EVAL(i) U (AEin(i) - KILL(i))
    // U = union(EVAL(i)) i ∈ all

    // -------------------------------
    // calU and recalEVAL want to make reference unique
    // EVAL[0] = { <blk, pos, 'a', '+', 'b'> } 
    // EVAL[1] = { <blk, pos, 'a', '+', 'b'> }
    // U       = { <blk, pos, 'a', '+', 'b'> }
    // let <blk, pos, 'a', '+', 'b'> be the same object 
    var U = this.calU(EVAL);
    // -------------------------------
    
    var KILL = this.calKILL(bbs, U, EVAL);
    var AEin = [];  // [Set {<opd1, opr, opd2>}]
    var AEout = []; // [Set {<opd1, opr, opd2>}]
    var workList = [];
    var inList = new Set;

    // init AEin, AEout, workList and inList
    for (var i = 0; i < bbs._bbs.length; i++) {
      if (bbs.isEntryIndex(i)) {
        AEin.push(new Set);
        AEout.push(new Set);
      } else {
        // use the direct reference of U, 
        // because we don't change U any more and SetOp is functional
        AEin.push(U);  
        AEout.push(U); 
        workList.push(i);
        inList.add(i);
      }
    }
    while (workList.length !== 0) {
      var cur = workList.shift();
      inList.delete(cur);
      var curIn = null;
      var curOut = null;
      var change =  false;
      for (var i of bbs.pred(cur)) {
        if (curIn === null) {
          curIn = AEout[i];
        } else {
          curIn = SetOp.interset(curIn, AEout[i]);
        }
      }
      if (!SetOp.equal(curIn, AEin[cur])) {
        change = true;
        AEin[cur] = curIn;
      }
      curOut = SetOp.union(EVAL[cur], 
                           SetOp.minus(AEin[cur], KILL[cur]));
      if (!SetOp.equal(curOut, AEout[cur])) {
        change = true;
        AEout[cur] = curOut;
      }

      if (change === true) {
        for (var i of bbs.succ(cur)) {
          if (!inList.has(i)) {
            workList.push(i); 
            inList.add(i);
          }
        }
      }
    } // end of while
    // console.log(U);
    // console.log(EVAL);
    // console.log(KILL);
    // console.log(AEin);
    // console.log(AEout);

    // apply the analysis
    for (var i = 0; i < bbs._bbs.length; i++) {
      var block = bbs.block(i);
      for (var aeb of AEin[i]) {
        for (var j = 0; j < block.length(); j++) {
          var inst = block.inst(j);
          if (inst instanceof ir.Move && 
              inst.from() instanceof ir.Bin &&
              (inst.from().left() instanceof ir.Reg || inst.from().left() instanceof ir.Int) && 
              (inst.from().right() instanceof ir.Reg || inst.from().right() instanceof ir.Int) &&
              inst.to() instanceof ir.Reg &&
              inst.from().op() === aeb.opr &&
              ((this.opdValueEqual(this.opdValue(inst.from().left()), aeb.opd1) && 
                this.opdValueEqual(this.opdValue(inst.from().right()), aeb.opd2)) ||
               (ir.Op.isComm(inst.from().op()) &&
                this.opdValueEqual(this.opdValue(inst.from().right()), aeb.opd1) && 
                this.opdValueEqual(this.opdValue(inst.from().left()), aeb.opd2)))) {
              for (var k = j-1; k > 0; k--) {
                if (block.insts(k) instanceof ir.Move &&
                    (this.opdValueEqual(this.opdValue(block.insts(k).left()), aeb.opd1) ||
                     this.opdValueEqual(this.opdValue(block.insts(k).left()), aeb.opd2))) {
                  break;
                }
              }
              var tj = ir.Reg.tmp();
              // replace
              inst._from = tj;
              for (var item of AEin[i]) {
                if (aeb.opd1 === item.opd1 && 
                    aeb.opr === item.opr && 
                    aeb.opd2 === item.opd2) {
                  if (item.hasReplace !== true) {
                    var lr = bbs.block(item.blk).inst(item.pos).to();
                    bbs.block(item.blk).inst(item.pos)._to = new ir.Reg(tj.name());
                    bbs.block(item.blk).insertAfter(item.pos, new ir.Move(null, new ir.Reg(tj.name()), lr));
                    // renumber
                    item.hasReplace = true;  
                    this.reNumber(EVAL[item.blk], item.pos+1);
                  } else {
                    inst._from = new ir.Reg(bbs.block(item.blk).inst(item.pos).to().name());
                  }
                }
              }
              for (var item of EVAL[i]) {
                if (item.pos === j) {
                  item.hasReplace = true;
                }
              }
          }
        }        
      }
    }
  },

  calU: function(EVAL) {
    var U = new Set;
    for (var i = 0; i < EVAL.length; i++) {
      for (var aeb of EVAL[i]) {
        U.add(aeb);
      }
    }
    return U;
  },
 
  calKILL: function(bbs, U, EVAL) {
    var KILL = [];
    for (var i = 0; i < bbs._bbs.length; i++) {
      KILL.push(new Set);
      var block = bbs.block(i);
      for (var j = 0; j < block.length(); j++) {
        var inst = block.inst(j);
        if (inst instanceof ir.Move) {
          // this only work on : inst.to() is ir.Reg
          for (var aeb of U) {
            if ((this.opdValueEqual(aeb.opd1, this.opdValue(inst.to())) ||
                 this.opdValueEqual(aeb.opd2, this.opdValue(inst.to()))) &&
                aeb.blk !== i) {
              KILL[i].add(aeb);
            }
          }
        }
      }
    }
    return KILL;
  },

  cloneSet:  function(s) {
    var result = new Set;
    for (var aeb of s) {
      result.add({blk: aeb.blk, 
                  pos: aeb.pos, 
                  opd1: aeb.opd1, 
                  opr: aeb.opr, 
                  opd2: aeb.opd2});
    }
    return result;
  }
};
