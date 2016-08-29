var $extend = require('../util/extend');
var $import = require('../util/import');
var Expr = require('./Expr');
var Func = require('../entity/Func');
module.exports = Call;

$extend(Call, Expr);
function Call(type, expr, args) {
  // Type type, Expr expr, Expr[] args
  Call.super.call(this, type);
  this._expr = expr;
  this._args = args;
};

$import(Call.prototype, {
  expr: function() {
    return this._expr;
  },

  args: function() {
    return this._args;
  },

  numArgs: function() {
    return this._args.length;
  },

  /** Returns true if this funcall is NOT a function pointer call. */
  isStaticCall: function() {
    return (this._expr.getEntityForce() instanceof Func);
  },

  /**
   * Returns a function object which is refered by expression.
   * This method expects this is static function call (isStaticCall()).
   */
  func: function() {
    var ent = this._expr.getEntityForce();
    if (ent == null) {
        throw new Error("not a static funcall");
    }
    return ent;
  }

});
