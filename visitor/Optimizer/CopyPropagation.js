var $extend = require('../../util/extend');
var $import = require('../../util/import');
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
      this.cpLocal(bbs, bbs._bbs[i]);
    }
  },

  cpLocal: function(bbs, bb) {
    this._ACP = new Set;
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
  }
};
