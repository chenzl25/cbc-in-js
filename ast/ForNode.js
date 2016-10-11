var $extend = require('../util/extend');
var $import = require('../util/import');
var StmtNode = require('./StmtNode');
var ExprStmtNode = require('./ExprStmtNode');
var IntegerLiteralNode = require('./IntegerLiteralNode');
var IntegerTypeRef  = require('../type/IntegerTypeRef')
module.exports = ForNode;

$extend(ForNode, StmtNode);
function ForNode(loc, init, cond, incr, body) {
  // Location loc, ExprNode init, ExprNode cond, ExprNode incr, StmtNode body
  ForNode.super.call(this, loc);
  if (init) {
    this._init = new ExprStmtNode(init.location(), init);
  }
  if (cond) {
    this._cond = cond;
  } else {
    this._cond = new IntegerLiteralNode(null, IntegerTypeRef.intRef(), 1);
  }
  if (incr) {
    this._incr = new ExprStmtNode(incr.location(), incr);
  }
  this._body = body;
};

$import(ForNode.prototype, {
  init: function() {
    return this._init;
  },

  cond: function() {
    return this._cond;
  },

  incr: function() {
    return this._incr;
  },

  body: function() {
    return this._body;
  }
});
