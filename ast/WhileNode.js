var $extend = require('../util/extend');
var $import = require('../util/import');
var StmtNode = require('./StmtNode');
module.exports = WhileNode;

$extend(WhileNode, StmtNode);
function WhileNode(loc, cond, body) {
  // Location loc, ExprNode cond, StmtNode body
  WhileNode.super.call(this, loc);
  this._cond = cond;
  this._body = body;
};

$import(WhileNode.prototype, {
  cond: function() {
    return this._cond;
  },

  body: function() {
    return this._body;
  }
   
});
