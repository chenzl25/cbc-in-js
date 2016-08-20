var $extend = require('../util/extend');
var $import = require('../util/import');
var LHSNode = require('./LHSNode');
module.exports = PtrMemberNode;

$extend(PtrMemberNode, LHSNode);
function PtrMemberNode(expr, member) {
  // ExprNode expr, String member
  this._expr = expr;
  this._member = member;
};

$import(PtrMemberNode.prototype, {
  dereferedCompositeType: function() {
    return this._expr.type().getPointerType().baseType().getCompositeType();
  },

  dereferedType: function() {
    return this._expr.type().getPointerType().baseType();
  },

  expr: function() {
    return this._expr;
  },

  member: function() {
    return this._member;
  },

  offset: function() {
    return this.dereferedCompositeType().memberOffset(this._member);
  },

  origType: function() {
    return this.dereferedCompositeType().memberType(this._member);
  },

  location: function() {
    return this._expr.location();
  },

  // accept
});
