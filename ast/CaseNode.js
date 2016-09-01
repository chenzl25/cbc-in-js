var $extend = require('../util/extend');
var $import = require('../util/import');
var StmtNode = require('./StmtNode');
var Label = require('../asm/Label');
module.exports = CaseNode;

$extend(CaseNode, StmtNode);
function CaseNode(loc, values, body) {
  // Location loc, ExprNode[] values, BlockNode body
  CaseNode.super.call(this, loc);
  this._values = values;
  this._body = body;
  this._label = new Label();
};

$import(CaseNode.prototype, {
  values: function() {
    return this._values;
  },

  body: function() {
    return this._body;
  },

  label: function() {
    return this._label;
  },

  isDefault: function() {
    return this._values.length === 0;
  }
   
});


