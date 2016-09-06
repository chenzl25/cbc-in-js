var $extend = require('../../util/extend');
var $import = require('../../util/import');
var IRVisitor = require('../AbstractVisitor/IRVisitor');
var BBS = require('../../bbs/BBS');
module.exports = BasicBlockBuilder;

$extend(BasicBlockBuilder, IRVisitor);
function BasicBlockBuilder() {

}

$import(BasicBlockBuilder.prototype, {
  build: function(ir) {
    this.buildDefinedFunctions(ir.definedFunctions());
  },

  buildDefinedFunctions: function(defuns) {
    for (var f of defuns) {
      var bbs = new BBS();
      bbs.build(f.ir());
      f.setBBS(bbs);
      // console.log(bbs);
    }
  }
});
