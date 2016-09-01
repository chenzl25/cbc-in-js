var $extend = require('../util/extend');
var $import = require('../util/import');
var Stmt = require('./Stmt');
module.exports = Store;

$extend(Store, Stmt);
function Store(loc, from, to) {
  // Location loc, Reg from, Expr to
  Store.super.call(this, loc);
  this._from = from;
  this._to = to;
};

$import(Store.prototype, {
  from: function() {
    return this._from;
  },

  to: function() {
    return this._to;
  },
});
