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
    for (var i = 0; i < bbs._bbs.length; i++) {
      this.cseLocal(bbs.block(i));
    }
  },

  cseLocal: function (block) {
    var AEB = new Set; // Set {<pos, opd1, opr, opd2, tmp>}
    for (var i = 0; i < block.length(); i++) {
      var inst = block.inst(i);
      var found = false;
      if (inst instanceof ir.Move && 
          inst.from() instanceof ir.Bin &&
          inst.from().left() instanceof ir.Reg && 
          inst.from().right() instanceof ir.Reg &&
          inst.to() instanceof ir.Reg) {
        // oprand of Bin shoule be Int or Reg
        for (var aeb of AEB) {
          // match current instruction's expression against those 
          // in AEB. including commutativity
          if (inst.from().op() === aeb.opr &&
              ((inst.from().left().name() === aeb.opd1 && 
                inst.from().right().name() === aeb.opd2) ||
               (ir.Op.isComm(inst.from().op()) &&
                inst.from().right().name() === aeb.opd1 && 
                inst.from().left().name() === aeb.opd2))) {
            var pos = aeb.pos;
            found = true;
            // if no variable in tuple, create a new temporary and
            // insert an instruction evaluating the expression
            // and assigning it to the temporary
            var tName;
            if (aeb.tmp === null) {
              var ti = ir.Reg.tmp();
              AEB.delete(aeb);
              AEB.add({pos: aeb.pos, 
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
          AEB.add({pos: i, 
                   opd1: inst.from().left().name(),
                   opr:  inst.from().op(),
                   opd2: inst.from().right().name(),
                   tmp: null})
        }
        for (var aeb of AEB) {
          if (aeb.opd1 === inst.to().name() || aeb.opd2 === inst.to().name()) {
            AEB.delete(aeb);
          }
        }
      } else {
        // TODO: add more elsif case to detect pointer related operation
      }
    }
  },

  reNumber: function(AEB, pos) {
    for (var aeb of AEB) {
      if (aeb.pos >= pos) {
        aeb.pos++;
      }
    }
  }
};
