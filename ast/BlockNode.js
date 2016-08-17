var $extend = require('../util/extend');
var $import = require('../util/import');
var StmtNode = require('./StmtNode');
module.exports = BlockNode;

$extend(BlockNode, StmtNode);
function BlockNode(loc, vars, stmts) {
  // Location loc, DefinedVariable[] vars, List<StmtNode> stmts
  BlockNode.super.call(this, loc);
  this._variables = vars;
  this._stmts= stmts;
  this._scope; // LocalScope
};

$import(BlockNode.prototype, {
  variables: function() {
    return this._variables;
  },

  stmts: function() {
    return this._stmts;
  },

  tailStmt: function() {
    return this._stmts.length === 0 ? null : this._stmts[this._stmts.length-1];
  },

  scope: function() {
    return this._scope;
  },

  setScope: function(scope) {
    this._scope = scope;
  }
  // accept
});
