var $extend = require('../util/extend');
var $import = require('../util/import');
var StmtNode = require('./StmtNode');
var ExprStmtNode = require('./ExprStmtNode');
module.exports = ForNode;

$extend(ForNode, StmtNode);
function ForNode(loc, init, cond, incr, body) {
  // Location loc, ExprNode init, ExprNode cond, ExprNode incr, StmtNode body
  ForNode.super.call(this, loc);
  this._init = new ExprStmtNode(init.location(), init);
  this._cond = cond;
  this._incr = new ExprStmtNode(incr.location(), incr);
  this._body = body;
};

$import(ForNode.prototype, {
  init: function() {
    return   this._init;
  },

  cond: function() {
    return   this._cond;
  },

  incr: function() {
    return   this._incr;
  },

  body: function() {
    return   this._body;
  },
  // accept
});
