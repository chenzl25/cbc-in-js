var $extend = require('../../util/extend');
var $import = require('../../util/import');
var SetOp = require('../../util/SetOp');
var Op = require('../../ir/Op');
var ir = require('../../ir/index');
var INT32 = require('../../asm/Type').INT32;
var VariableCollector = require('../../visitor/Collector/VariableCollector');
var PointerRelated = require('../../visitor/Collector/PointerRelated');
module.exports = ConstantPropagation;

function ConstantPropagation() {
  this._top = 'top';
  this._down = 'down';
}

ConstantPropagation.prototype = {
  optimize: function(ir) {
    if ((new PointerRelated()).collect(ir)) {
      return;
    }
    this.cpDefinedFunctions(ir.definedFunctions());
  },

  cpDefinedFunctions: function(defuns) {
    for (var f of defuns) {
      this.cpDefinedFunction(f.bbs());
    }
  },

  cpDefinedFunction: function(bbs) {
    var U = this.calAllVariable(bbs); // set of all Variable
    var In = [];                      // Array of the Map {name -> lattice}
    var Out = [];                     // Array of the Map {name -> lattice}
    var workList = [];
    var inList = new Set;
    for (var i = 0; i < bbs._bbs.length; i++) {
      In.push(this.initMap(U));
      Out.push(this.initMap(U));
      if (!bbs.isEntryIndex(i)) {
        workList.push(i);
        inList.add(i);
      }
    }

    while (workList.length !== 0) {
      var cur = workList.shift();
      inList.delete(cur);
      var curIn = null;
      var curOut = null;
      for (var i of bbs.pred(cur)) {
        if (curIn === null) {
          curIn = Out[i];
        } else {
          curIn = this.calMapLattice(curIn, Out[i]);
        }
      }
      In[cur] = curIn;

      curOut = this.calBlockMap(this.cloneMap(curIn), bbs.block(cur));
      if (!this.equalMap(curOut, Out[cur])) {
        Out[cur] = curOut
        for (var i of bbs.succ(cur)) {
          if (!inList.has(i)) {
            workList.push(i); 
            inList.add(i);
          }
        }
      }
    } // end of while
    // console.log(Out)

    // apply the analysis
    for (var i = 0; i < bbs._bbs.length; i++) {
      this.applyAnalysis(bbs.block(i), Out[i]);
    }
  },

  calAllVariable: function(bbs) {
    var U = new Set;
    for (var i = 0; i < bbs._bbs.length; i++) {
      var tmpSet = (new VariableCollector()).collect(bbs._bbs[i]);
      U = SetOp.union(U, tmpSet);
    }
    return U;
  },

  initMap: function(U) {
    var result = new Map;
    for (var name of U) {
      result.set(name, this._top);
    }
    return result;
  },

  calMapLattice: function(m1, m2) {
    var result = new Map;
    for (var key of m1.keys()) {
      result.set(key, this.calLattice(m1.get(key),m2.get(key)));
    }
    return result;
  },

  calLattice: function(a, b, op) {
    if (a === this._down || b === this._down) {
      return this._down;
    } else if (typeof a === 'number' && typeof b === 'number') {
      if (op) {
        return this.evalBin(op, a, b);
      } else {
        if (a === b) return a;
        else return this._down;
      }
    } else if (a === this._top) {
      return b;
    } else if (b === this._top) {
      return a;
    } else {
      throw new Error('Lattice impossible case');
    }
  },

  equalMap: function(m1, m2) {
    var result = new Map;
    for (var key of m1.keys()) {
      if (m1.get(key) !== m2.get(key)) return false;
    }
    return true;
  },

  cloneMap: function(m) {
    var result = new Map;
    for (var key of m.keys()) {
      result.set(key, m.get(key));
    }
    return result;
  },

  calBlockMap: function(blockIn, bb) {
    for (var i = 0; i < bb.length(); i++) {
      var inst = bb.inst(i);
      if (inst instanceof ir.Move) {
        if (inst.to() instanceof ir.Reg) {
          if (inst.from() instanceof ir.Int) {
            var curValue;
            curValue = this.calLattice(inst.from().value(), blockIn.get(inst.to().name()));
            blockIn.set(inst.to().name(), curValue);
          } else if (inst.from() instanceof ir.Bin && 
                     inst.from().left() instanceof ir.Reg &&
                     inst.from().right() instanceof ir.Reg) {
            var curValue;
            var lv = blockIn.get(inst.from().left().name());
            var rv = blockIn.get(inst.from().right().name());
            curValue = this.calLattice(lv, rv, inst.from().op()); // Bin Version Lattice
            blockIn.set(inst.to().name(), this.calLattice(blockIn.get(inst.to().name()), curValue));
          } else if (inst.from() instanceof ir.Uni &&
                     typeof blockIn.get(inst.from().expr().name()) === 'number') {
            var curValue;
            var lv = blockIn.get(inst.from().expr().name());
            curValue = this.evalUni(inst.from().op(), lv);
            blockIn.set(inst.to().name(), this.calLattice(blockIn.get(inst.to().name()), curValue));
          } else if (inst.from() instanceof ir.Reg) {
            blockIn.set(inst.to().name(), blockIn.get(inst.from().name()));
          } else {
            blockIn.set(inst.to().name(), this._down);
          }
        } else if (inst.to() instanceof ir.Mem) {
          // TODO
        } else {
          // impossible
        }
      }
    }
    return blockIn;
  },

  evalBin: function(op, l, r) {
    switch (node.op()) {
      case Op.ADD: return  lv + rv;
      case Op.SUB: return  lv - rv;
      case Op.MUL: return  lv * rv;
      case Op.S_DIV: 
        if (rv === 0) {this.warn('divided by zero'); return this._down;}
        if (lv / rv % 1 !== 0) return this._down;
        return  lv / rv;
      case Op.U_DIV: 
        if (rv === 0) {this.warn('divided by zero'); return this._down;}
        if (lv / rv % 1 !== 0) return this._down;
        return  lv / rv;
      case Op.S_MOD: return  lv % rv;
      case Op.U_MOD: return  lv % rv;
      case Op.BIT_AND: return  lv & rv;
      case Op.BIT_OR: return  lv | rv;
      case Op.BIT_XOR: return  lv ^ rv;
      case Op.BIT_LSHIFT: return  lv << rv;
      case Op.BIT_RSHIFT: return  lv >> rv;
      case Op.ARITH_RSHIFT: return  lv >> rv;
      case Op.EQ: return  (lv === rv)? 1 : 0;
      case Op.NEQ: return  (lv !== rv)? 1 : 0;
      case Op.S_GT: return  (lv > rv)? 1 : 0;
      case Op.S_GTEQ: return  (lv >= rv)? 1 : 0;
      case Op.S_LT: return  (lv < rv)? 1 : 0;
      case Op.S_LTEQ: return  (lv <= rv)? 1 : 0;
      case Op.U_GT: return  (lv > rv)? 1 : 0;
      case Op.U_GTEQ: return  (lv >= rv)? 1 : 0;
      case Op.U_LT: return  (lv < rv)? 1 : 0;
      case Op.U_LTEQ: return  (lv <= rv)? 1 : 0;
      default: throw new Error('impossible reach here');
    }
  },

  evalUni: function(op, lv) {
    switch (op) {
      case Op.UMINUS: return -lv;
      case Op.BIT_NOT: return ~lv;
      case Op.NOT: return lv>0?-1:1;
      default:
        throw new Error("unknown unary op: " + op);
    }
  },

  applyAnalysis: function(block, blockOut) {
    for (var i = 0; i < block.length(); i++) {
      var inst = block.inst(i);
      if (inst instanceof ir.Move) {
        if (inst.from() instanceof ir.Bin) {
          if (inst.from().left() instanceof ir.Reg && 
              typeof blockOut.get(inst.from().left().name()) === 'number') {
              inst.from()._left = new ir.Int(INT32, blockOut.get(inst.from().left().name()));
          }
          if (inst.from().right() instanceof ir.Reg && 
              typeof blockOut.get(inst.from().right().name()) === 'number') {
              inst.from()._right = new ir.Int(INT32, blockOut.get(inst.from().right().name()));
          }
          // TODO other type
          // if (inst.from().left() instanceof ir.Mem ) {/*TODO*/}
          // if (inst.from().right() instanceof ir.Mem ) {/*TODO*/}
          // if (inst.from().left() instanceof ir.Addr ) {/*TODO*/}
          // if (inst.from().right() instanceof ir.Addr ) {/*TODO*/}
        } else if (inst.from() instanceof ir.Uni) {
          var value = blockOut.get(inst.from().expr().name());
          if (typeof value === 'number') {
            inst.from()._expr = new ir.Int(INT32, value);
          }
        } else if (inst.from() instanceof ir.Reg) {
          var value = blockOut.get(inst.from().name());
          if (typeof value === 'number') {
            inst._from = new ir.Int(INT32, value);
          }
        } else if (inst.from() instanceof ir.Call) {
          for (var j = 0; j <  inst.from()._args.length; j++) {
            var arg = inst.from()._args[j];
            if (arg instanceof ir.Reg && 
                typeof blockOut.get(arg.name()) === 'number') {
              inst.from()._args[j] = new ir.Int(INT32, blockOut.get(arg.name()));
            } else {
              // TODO other type
            }
          }
        } 
      } else if (inst instanceof ir.Return) {
        if (inst.expr() instanceof ir.Reg && 
            typeof blockOut.get(inst.expr().name()) === 'number') {
          inst._expr = new ir.Int(INT32, blockOut.get(inst.expr().name()));
        } else {
          // TODO other type
        }
      } else if (inst instanceof ir.Switch) {
        if (inst.cond() instanceof ir.Reg &&
            typeof blockOut.get(inst.cond().name()) === 'number') {
          inst._cond = new ir.Int(INT32, blockOut.get(inst.cond().name()));
        }
      }
    }
  },

  warn: function(msg) {
    console.log(msg);
  }
};
