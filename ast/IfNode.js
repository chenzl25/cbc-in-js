var $extend = require('../util/extend');
var $import = require('../util/import');
var StmtNode = require('./StmtNode');
module.exports = IfNode;

$extend(IfNode, StmtNode);
function IfNode(loc, c, t, e) {
  // Location loc, ExprNode c, StmtNode t, StmtNode e
  IfNode.super.call(this, loc);
  this._cond = c;
  this._thenBody = t;
  this._elseBody = e;
};

$import(IfNode.prototype, {
  cond: function() {
    return this._cond;
  },

  thenBody: function() {
    return this._thenBody;
  },

  elseBody: function() {
    return this._elseBody;
  }
  // accept
});
