var $extend = require('../../util/extend');
var $import = require('../../util/import');
var BlockVisitor = require('../AbstractVisitor/BlockVisitor');
module.exports = VariableCollector;

$extend(VariableCollector, BlockVisitor);
function VariableCollector() {
  this._set = new Set;
}

$import(VariableCollector.prototype, {
  collect: function(block) {
    this._set = new Set;
    this.visitInsts(block.insts());
    return this._set;
  },

  visitReg: function(unit) {
    this._set.add(unit.name());
  }
});
