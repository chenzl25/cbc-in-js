var $extend = require('../util/extend');
var $import = require('../util/import');
var ExprNode = require('./ExprNode');
module.exports = AbstractAssignNode;

$extend(AbstractAssignNode, ExprNode);
function AbstractAssignNode(lhs, rhs) {
  // ExprNode lhs, ExprNode rhs
  this._lhs = lhs;
  this._rhs = rhs;
};

$import(AbstractAssignNode.prototype, {
  type: function() {
    return this._lhs.type();
  },

  lhs: function() {
    return this._lhs;
  },

  rhs: function() {
    return this._rhs;
  },

  setRHS: function(expr) {
    this._rhs = expr;
  },

  location: function() {
    this._lhs.location();
    return this._lhs.location();
  }
});

