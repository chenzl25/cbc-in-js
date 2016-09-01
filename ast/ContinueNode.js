var $extend = require('../util/extend');
var $import = require('../util/import');
var StmtNode = require('./StmtNode');
module.exports = ContinueNode;

$extend(ContinueNode, StmtNode);
function ContinueNode(loc) {
  // Location loc
  ContinueNode.super.call(this, loc);
};

$import(ContinueNode.prototype, {
   
});

