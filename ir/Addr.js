var $extend = require('../util/extend');
var $import = require('../util/import');
var Expr = require('./Expr');
module.exports = Addr;

$extend(Addr, Expr);
function Addr(type, entity) {
  // Type type, Entity entity
  Addr.super.call(this, type);
  this._entity = entity;
};

$import(Addr.prototype, {
  isAddr: function() {
    return true;
  },

  entity: function() {
    return this._entity;
  },

  address: function() {
    return this._entity.address();
  },

  memref: function() {
    return this._entity.memref();
  },

  getEntityForce: function() {
    return this._entity;
  }
});
