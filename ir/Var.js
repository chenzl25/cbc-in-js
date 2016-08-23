var $extend = require('../util/extend');
var $import = require('../util/import');
var Expr = require('./Expr');
var Addr = require('./Addr');
module.exports = Var;

$extend(Var, Expr);
function Var(type, entity) {
  // Type type, Entity entity
  Var.super.call(this, type);
  this._entity = entity;
};

$import(Var.prototype, {
  isVar: function() {
    return true;
  },

  type: function() {
    if (Var.super.prototype.type.call(this) == null) {
      throw new Error("Var is too big to load by 1 insn");
    }
    return Var.super.prototype.type.call(this);
  },

  name: function() {
    return this._entity.name();
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

  addressNode: function(type) {
    return new Addr(type, this._entity);
  },

  getEntityForce: function() {
    return this._entity;
  }
});
