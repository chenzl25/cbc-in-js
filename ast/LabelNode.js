var $extend = require('../util/extend');
var $import = require('../util/import');
var StmtNode = require('./StmtNode');
module.exports = LabelNode;

$extend(LabelNode, StmtNode);
function LabelNode(loc, name, stmt) {
  // Location loc, String name, StmtNode stmt
  LabelNode.super.call(this, loc);
  this._name = name;
  this._stmt = stmt;
};

$import(LabelNode.prototype, {
  name: function() {
    return this._name;
  },

  stmt: function() {
    return this._stmt;
  },
  // accept
});

