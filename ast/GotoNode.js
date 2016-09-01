var $extend = require('../util/extend');
var $import = require('../util/import');
var StmtNode = require('./StmtNode');
module.exports = GotoNode;

$extend(GotoNode, StmtNode);
function GotoNode(loc, target) {
  // Location loc, String target
  GotoNode.super.call(this, loc);
  this._target = target;
};

$import(GotoNode.prototype, {
  target: function() {
    return this._target;
  }
   
});
