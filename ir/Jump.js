var $extend = require('../util/extend');
var $import = require('../util/import');
var Stmt = require('./Stmt');
module.exports = Jump;

$extend(Jump, Stmt);
function Jump(loc, label) {
  // Location loc, Label label
  Jump.super.call(this, loc);
  this._label = label;
};

$import(Jump.prototype, {
  label: function() {
    return this._label;
  }
});

