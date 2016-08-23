var $extend = require('../util/extend');
var $import = require('../util/import');
var Expr = require('./Expr');
module.exports = Mem;

$extend(Mem, Expr);
function Mem(type, expr) {
  // Type type, Expr expr
  Mem.super.call(this, type);
  this._expr = expr;
};

$import(Mem.prototype, {
  expr: function() {
    return this._expr;
  },

  addressNode: function(type) {
    return  this._expr;
  }
});
