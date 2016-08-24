var $extend = require('../util/extend');
var $import = require('../util/import');
var Expr = require('./Expr');
module.exports = Bin;

$extend(Bin, Expr);
function Bin(type, op, left, right) {
  // Type type, Op op, Expr left, Expr right
  Bin.super.call(this, type);
  this._op = op;
  this._left = left;
  this._right = right;
};

$import(Bin.prototype, {
  left: function() {
    return this._left;
  },

  right: function() {
    return this._right;
  },

  op: function() {
    return this._op;
  }
});

