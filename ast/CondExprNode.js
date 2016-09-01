var $extend = require('../util/extend');
var $import = require('../util/import');
var ExprNode = require('./ExprNode');
module.exports = CondExprNode;

$extend(CondExprNode, ExprNode);
function CondExprNode(cond, t, e) {
  // ExprNode cond, ExprNode t, ExprNode e
  this._cond = cond;
  this._thenExpr = t;
  this._elseExpr = e;
};

$import(CondExprNode.prototype, {
  type: function() {
    return this._thenExpr.type();
  },

  cond: function() {
    return this._cond;
  },

  thenExpr: function() {
    return this._thenExpr;
  },

  setThenExpr: function(expr) {
    this._setThenExpr = expr;
  },

  elseExpr: function() {
    return this._elseExpr;
  },

  setElseExpr: function(expr) {
    this._setElseExpr = expr;
  },

  location: function() {
    return this._cond.location();
  },
   
});
