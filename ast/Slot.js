var $extend = require('../util/extend');
var $import = require('../util/import');
var Node = require('./Node');
var Type = require('../type/Type');
module.exports = Slot;

$extend(Slot, Node);
function Slot(t, n) {
  // TypeNode t, String n
  this._typeNode = t;
  this._name = n;
  this._offset = Type.sizeUnknown;
};

$import(Slot.prototype, {
  typeNode: function() {
    return this._typeNode;
  },

  typeRef: function() {
    return this._typeNode.typeRef();
  },

  type: function() {
    return this._typeNode.type();
  },

  name: function() {
    return this._name;
  },

  size: function() {
    return this._typeNode.size();
  },

  allocSize: function() {
    return this._typeNode.allocSize();
  },

  alignment: function() {
    return this._typeNode.alignment();    
  },

  offset: function() {
    return this._offset;
  },

  setOffset: function(offset) {
    this._offset = offset;
  },

  location: function() {
    return this._typeNode.location();
  }
});
