var $extend = require('../util/extend');
var $import = require('../util/import');
var LHSNode = require('./LHSNode');
module.exports = DereferenceNode;

$extend(DereferenceNode, LHSNode);
function DereferenceNode(expr) {
  // ExprNode expr
  this._expr = expr
};

$import(DereferenceNode.prototype, {
  origType: function() {
    return this._expr.type().baseType();
  },

  expr: function() {
    return this._expr;
  },

  setExpr: function(expr) {
    this._expr = expr;
  },

  location: function() {
    return this._expr.location();
  },
   
});
