var $extend = require('../util/extend');
var $import = require('../util/import');
var LHSNode = require('./LHSNode');
var UserType = require('../type/UserType');
module.exports = MemberNode;

$extend(MemberNode, LHSNode);
function MemberNode(expr, member) {
  // ExprNode expr, String member
  this._expr = expr;
  this._member = member;
};

$import(MemberNode.prototype, {
  baseType: function() {
    return this._expr.type().getCompositeType();
  },

  expr: function() {
    return this._expr;
  },

  member: function() {
    return this._member;
  },

  offset: function() {
    return this.baseType().memberOffset(this._member);
  },

  origType: function() {
    return this.baseType().memberType(this._member);
  },

  location: function() {
    return this._expr.location();
  }
});
