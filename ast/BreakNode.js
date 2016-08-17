var $extend = require('../util/extend');
var $import = require('../util/import');
var StmtNode = require('./StmtNode');
module.exports = BreakNode;

$extend(BreakNode, StmtNode);
function BreakNode(loc) {
  // Location loc
  BreakNode.super.call(this, loc);
};

$import(BreakNode.prototype, {
  // accept
});

