var $extend = require('../util/extend');
var $import = require('../util/import');
var Type = require('./Type');
module.exports = NamedType;

$extend(NamedType, Type);
function NamedType(name, loc) {
  // String name, Location loc
  this._name = name;
  this._location = loc;
};

$import(NamedType.prototype, {
  name: function() {
    return this._name;
  },

  location: function() {
    return this._location;
  }
});

