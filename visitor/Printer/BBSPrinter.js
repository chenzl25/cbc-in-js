var $extend = require('../../util/extend');
var $import = require('../../util/import');
var IRVisitor = require('../AbstractVisitor/IRVisitor');
var IRQPrinter = require('./IRQPrinter');
module.exports = BBSPrinter;



$extend(BBSPrinter, IRVisitor);
function BBSPrinter() {

}

$import(BBSPrinter.prototype, {
  print: function(ir) {
    irqPrinter = new IRQPrinter();
    // change bbs to ir
    this.transformDefinedFunctions(ir.definedFunctions());
    irqPrinter.print(ir);
  },

  transformDefinedFunctions: function(defuns) {
    for (var f of defuns) {
      this.transformDefinedFunction(f);
    }
  },

  transformDefinedFunction: function(defun) {
    var bbs = defun.bbs();
    var newIr = [];
    for (var bb of bbs.blocks()) {
      newIr = newIr.concat(bb.insts())
    }
    defun.setIR(newIr);
  },
});
