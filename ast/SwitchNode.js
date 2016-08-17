var $extend = require('../util/extend');
var $import = require('../util/import');
var StmtNode = require('./StmtNode');
module.exports = SwitchNode;

$extend(SwitchNode, StmtNode);
function SwitchNode(loc, cond, cases) {
  // Location loc, ExprNode cond, CaseNode[] cases
  SwitchNode.super.call(this, loc);
  this._cond = cond;
  this._cases = cases;
};

$import(SwitchNode.prototype, {
  cond: function() {
    return this._cond;
  },

  cases: function() {
    return this._cases;
  }
  // accept
});
