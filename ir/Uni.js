var $extend = require('../util/extend');
var $import = require('../util/import');
var Expr = require('./Expr');
module.exports = Uni;

$extend(Uni, Expr);
function Uni(type, op, expr) {
  // Type type, Op op, Expr expr
  Uni.super.call(this, type);
  this._op = op;
  this._expr = expr;
};

$import(Uni.prototype, {
  op: function() {
    return this._op;
  },

  expr: function() {
    return this._expr;
  },
});