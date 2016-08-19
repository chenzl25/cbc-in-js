var $extend = require('../util/extend');
var $import = require('../util/import');
var TypeDefinition = require('./TypeDefinition');
var UserTypeRef = require('../type/UserTypeRef');
var UserType = require('../type/UserType');
var TypeNode = require('./TypeNode');
module.exports = TypedefNode;

$extend(TypedefNode, TypeDefinition);
function TypedefNode(loc, real, name) {
  // Location loc, TypeRef real, String name
  TypedefNode.super.call(this, loc, new UserTypeRef(name), name);
  this._real = new TypeNode(real);
};

$import(TypedefNode.prototype, {
  isUserType: function() {
    return true;
  },

  realTypeNode: function() {
    return this._real;
  },

  realType: function() {
    return this._real.type();
  },

  realTypeRef: function() {
    return this._real.typeRef();
  },

  definingType: function() {
    return new UserType(this.name(), this.realTypeNode(), this.location());
  }
  // accept
});
