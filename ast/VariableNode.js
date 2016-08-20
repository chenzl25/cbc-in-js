var $extend = require('../util/extend');
var $import = require('../util/import');
var LHSNode = require('./LHSNode');
var Location = require('./Location');
var DefinedVariable = require('../entity/DefinedVariable');
module.exports = VariableNode;

$extend(VariableNode, LHSNode);
function VariableNode(_1, _2) {
  if (_1 instanceof Location) {
    // Location _1, String _2
    this._location = _1;
    this._name = _2;
  } else if (_1 instanceof DefinedVariable) {
    // Entity _1
    this._entity = _1;
    this._name = this._entity.name();
  } else {
    throw new Error('VariableNode constructor parameter type error');
  }
};

$import(VariableNode.prototype, {
  name: function() {
    return this._name;
  },

  isResolved: function() {
    return this._entity? true: false;
  },

  entity: function() {
    if (!this._entity) {
      throw new Error('VariableNode non-entity');
    }
    return this._entity;
  },

  setEntity: function(ent) {
    this._entity = ent;
  },

  typeNode: function() {
    return this.entity().typeNode();
  },

  isParameter: function() {
    return this.entity().isParameter();
  },

  origType: function() {
    return this.entity().type();
  },

  location: function() {
    return this._location;
  },

  // accept
});