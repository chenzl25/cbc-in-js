var $extend = require('../util/extend');
var $import = require('../util/import');
var TypeRef = require('./TypeRef');
var Location = require('../ast/Location');
module.exports = UserTypeRef;

$extend(UserTypeRef, TypeRef);
function UserTypeRef(loc, name) {
  // Location loc, String name
  if (!(loc instanceof Location)) {
    name = loc;
    loc = null;
  }
  UserTypeRef.super.call(this, loc);
  this._name = name;
};

$import(UserTypeRef.prototype, {
  isUserType: function() {
    return true;
  },

  name: function() {
    return this._name;
  },

  equals: function(other) {
    return (other instanceof UserTypeRef) && 
           this._name === other._name;
  },

  toString: function() {
    return this._name;
  }
});

