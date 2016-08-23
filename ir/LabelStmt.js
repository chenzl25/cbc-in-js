var $extend = require('../util/extend');
var $import = require('../util/import');
var Stmt = require('./Stmt');
module.exports = LabelStmt;

$extend(LabelStmt, Stmt);
function LabelStmt(loc, label) {
  // Location loc, Label label
  LabelStmt.super.call(this, loc);
  this._label = label;
};

$import(LabelStmt.prototype, {
  label: function() {
    return this._label;
  }
});
