var $extend = require('../util/extend');
var $import = require('../util/import');
var ExprNode = require('./ExprNode');
module.exports = FuncallNode;

$extend(FuncallNode, ExprNode);
function FuncallNode(expr, args) {
  // ExprNode expr, ExprNode[] args
  this._expr = expr;
  this._args = args;
};

$import(FuncallNode.prototype, {
  expr: function() {
    return this._expr;
  },

  type: function() {
    return this.functionType().returnType();
  },

  functionType: function() {
    return this._expr.type().baseType();
  },

  numArgs: function() {
   return this._args.size();
  },

  args: function() {
  return this._args;
  },

  replaceArgs: function(args) {
    this._args = args;
  },

  location: function() {
    return this._expr.location();
  },

  // accept
});
