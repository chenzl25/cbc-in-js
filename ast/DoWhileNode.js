var $extend = require('../util/extend');
var $import = require('../util/import');
var StmtNode = require('./StmtNode');
module.exports = DoWhileNode;

$extend(DoWhileNode, StmtNode);
function DoWhileNode(loc, body, cond) {
  DoWhileNode.super.call(this, loc);
  this._body = body;
  this._cond = cond;
};

$import(DoWhileNode.prototype, {
  body: function() {
    return this._body;
  },

  cond: function() {
    return this._cond;
  },
  // accept
});
