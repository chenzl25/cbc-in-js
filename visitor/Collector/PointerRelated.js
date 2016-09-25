var $extend = require('../../util/extend');
var $import = require('../../util/import');
var BlockVisitor = require('../AbstractVisitor/BlockVisitor');
module.exports = PointerRelated;

$extend(PointerRelated, BlockVisitor);
function PointerRelated() {
	this._isPointerRelated = false;
}

$import(PointerRelated.prototype, {
  collect: function(ir) {
    var defuns = ir.definedFunctions();
    for (var f of defuns) {
      var bbs = f.bbs();
      for (var i = 0; i < bbs._bbs.length; i++) {
        if (this.collectBlock(bbs._bbs[i])) {
          return true;
        }
      }
    }
    return false;
  },

  collectBlock: function(block) {
    this.visitInsts(block.insts());
    return this._isPointerRelated;
  },

  visitAddr: function() {
  	this._isPointerRelated = true;
  },

  visitMem: function() {
  	this._isPointerRelated = true;
  }
});
