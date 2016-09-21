var $extend = require('../../util/extend');
var $import = require('../../util/import');
var setOp = require('../../util/setOP');
var ir = require('../../ir/index');
module.exports = CopyPropagation;

function CopyPropagation() {
  this._ACP = new Set; // {Reg -> Reg}
}

CopyPropagation.prototype = {
  optimize: function(ir) {
    this.cpDefinedFunctions(ir.definedFunctions());
  },

  cpDefinedFunctions: function(defuns) {
    for (var f of defuns) {
      this.cpDefinedFunction(f.bbs());
    }
  },

  cpDefinedFunction: function(bbs) {
    for (var i = 0; i < bbs._bbs.length; i++) {
      this.cpLocal(bbs._bbs[i], new Set);
    }
    this.cpGlobal(bbs);
  },

  cpLocal: function(bb, ACP) {
    this._ACP = ACP
    for (i = 0; i < bb._insts.length; i++) {
      var inst = bb._insts[i];
      if (inst instanceof ir.Return) {
        if (inst.expr() instanceof ir.Reg) inst._expr = this.copyValue(inst.expr());
      } else if (inst instanceof ir.Move) {
        if (inst.from() instanceof ir.Bin) {
          if (inst.from().left() instanceof ir.Reg) inst.from()._left = this.copyValue(inst.from().left());
          if (inst.from().right() instanceof ir.Reg) inst.from()._right = this.copyValue(inst.from().right());
        } else if (inst.from() instanceof ir.Uni) {
          if (inst.from().expr() instanceof ir.Reg) inst.from()._expr = this.copyValue(inst.from().expr());
        } else if (inst.from() instanceof ir.Reg) {
          if (inst.from() instanceof ir.Reg) inst._from = this.copyValue(inst.from());
        } else if (inst.from() instanceof ir.Call) {
          for (var j = 0; j < inst.from()._args.length; j++) {
            if (inst.from()._args[j] instanceof ir.Reg) {
              inst.from()._args[j] = this.copyValue(inst.from()._args[j]);
            }
          }
        }
      } else if (inst instanceof ir.Switch || inst instanceof ir.CJump) {
        if (inst.cond() instanceof ir.Reg) inst._cond = this.copyValue(inst.cond());
      }
      if (inst instanceof ir.Move) this.removeACP(inst.to());
      if (inst instanceof ir.Move &&
          inst.from() instanceof ir.Reg &&
          inst.from().name() !== inst.to().name())
          this._ACP.add({first: inst.to(), second: inst.from()});  
    }
  },

  copyValue: function(reg) {
    for (var item of this._ACP) {
      if (item.first.name() === reg.name()) {
        return new ir.Reg(item.second.name());
      } 
    }
    return reg;
  },

  removeACP: function(reg) {
    newACp = new Set;
    for (var item of this._ACP) {
      if (item.first.name() === reg.name() || 
          item.second.name() === reg.name()) {
        // do nothing
      } else {
        newACp.add(item);
      }
    }
    this._ACP = newACp;
  },

  cpGlobal: function(bbs) {
    // COPY(i): the set of assignments in Block[i] and
    //          reach the end of the Block[i] without being killed
    // KILL(i): the set of assignments are killed by Block[i]
    // assignment : <u, v, blk, pos>   <=>   Block[blk][pos] === u <- v
    // CPin(i) = interset(CPout(j)), j ∈ Pred(i)
    // CPout(i) = union(COPY(i), CPin(i) - KILL(i))
    // U = union(COPY(i)), i ∈ all

    var COPY = this.calCOPY(bbs); // Map Number -> Set {<u, v, blk, pos>}
    var KILL = this.calKILL(bbs, COPY); // same as above
    var CPin = new Map;                 // same as above
    var CPout = new Map;                // same as above
    var U = new Set;
    var workList = [];
    var inList = new Set;
    for (var tmpSet of COPY.values()) {
      U = setOp.union(U, tmpSet);
    }
    for (var i = 0; i < bbs._bbs.length; i++) {
      if (bbs.isEntryIndex(i)) {
        CPin.set(i, new Set);
        CPout.set(i, new Set);
      } else {
        CPin.set(i, U);
        CPout.set(i, U);
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
          curIn = CPout.get(i);
        } else {
          curIn = setOp.interset(curIn, CPout.get(i));
        }
      }
      if (!setOp.equal(curIn, CPin.get(cur))) {
        change = true;
        CPin.set(cur, curIn);
      }


      curOut = setOp.union(COPY.get(cur), 
                           setOp.minus(CPin.get(cur), KILL.get(cur)));
      if (!setOp.equal(curOut, CPout.get(cur))) {
          change = true;
          CPout.set(cur, curOut);
      }

      if (change === true) {
        for (var i of bbs.succ(cur)) {
          if (!inList.has(i)) {
            workList.push(i); 
            inList.add(i);
          }
        }
      }
    }

    // apply the analysis
    for (var i = 0; i < bbs._bbs.length; i++) {
      this.cpLocal(bbs._bbs[i], CPin.get(i));
    }

    // console.log('----------')
    // print(COPY);
    // print(KILL);
    // print(CPin);
    // print(CPout);

    // function print(m) {
    //   console.log('Map: {');
    //   for (var i of m.keys()) {
    //     var s = "  " + i.toString() + " => Set {"
    //     var tmpSet = m.get(i);
    //     for (var item of tmpSet) {
    //       s += 'first: ' + item.first.name() + ' second: ' + item.second.name() +
    //            ' blk: ' + item.blk + ' pos: ' + item.pos;
    //       s += ', '
    //     }
    //     s += " }"
    //     console.log(s);
    //   }
    //   console.log('}');
    // }
  },

  calCOPY: function(bbs) {
    var COPY = new Map;
    for (var i = 0; i < bbs._bbs.length; i++) {
      this._ACP = new Set;
      for (var j = 0; j < bbs._bbs[i]._insts.length; j++) {
        var inst = bbs._bbs[i]._insts[j];
        if (inst instanceof ir.Move) this.removeACP(inst.to());
        if (inst instanceof ir.Move &&
            inst.from() instanceof ir.Reg &&
            inst.from().name() !== inst.to().name())
            this._ACP.add({first: inst.to(), second: inst.from(), blk: i, pos: j});
      }
      COPY.set(i, this._ACP);
    }
    return COPY;
  },

  calKILL: function(bbs, COPY) {
    var KILL = new Map;
    for (var i = 0; i < bbs._bbs.length; i++) {
      var nameSet = new Set();
      var subKILL = new Set;
      for (var j = 0; j < bbs._bbs[i]._insts.length; j++) {
        var inst = bbs._bbs[i]._insts[j];
        if (inst instanceof ir.Move) nameSet.add(inst.to().name());
      }
      for (var key of COPY.keys()) {
        if (key !== i) {
          var tmpSet = COPY.get(key);
          for (var item of tmpSet) {
            for (var name of nameSet) {
              if (item.first.name() === name || 
                  item.second.name() === name) {
                subKILL.add(item);
                break;
              }
            }
          }
        }
      }
      KILL.set(i, subKILL);
    }
    return KILL;
  }
};
