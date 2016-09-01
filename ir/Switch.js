var $extend = require('../util/extend');
var $import = require('../util/import');
var Stmt = require('./Stmt');
module.exports = Switch;

$extend(Switch, Stmt);
function Switch(loc, cond, cases, defaultLabel, endLabel) {
  // Location loc, Expr cond, Case[] cases, Label defaultLabel, Label endLabel
  Switch.super.call(this, loc);
  this._cond = cond;
  this._cases = cases;
  this._defaultLabel = defaultLabel;
  this._endLabel = endLabel;
};

$import(Switch.prototype, {
  cond: function() {
    return this._cond;
  },

  cases: function() {
    return this._cases;
  },

  defaultLabel: function() {
    return this._defaultLabel;
  },

  endLabel: function() {
    return this._endLabel;
  },
   
})
