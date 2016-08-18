var $extend = require('../util/extend');
var $import = require('../util/import');
var Scope = require('./Scope');
var ErrorHandler = require('../util/ErrorHandler');
var Variable = require('../entity/Variable');
var DefinedVariable = require('../entity/DefinedVariable');
module.exports = ToplevelScope;

$extend(ToplevelScope, Scope);
function ToplevelScope() {
  ToplevelScope.super.call(this);
  this._entities = new Map(); // String -> Entity
  this._staticLocalVariables = null; // DefinedVariable[]
};

$import(ToplevelScope.prototype, {
  isToplevel: function() {
    return true;
  },

  ToplevelScope: function() {
    return this;
  },

  parent: function() {
    return null;
  },

  /** Declare variable or function globally. */
  declareEntity: function(entity) {
    if (this._entities.has(entity.name())) {
      var beforeEntity = this.get(entity.name());
      this.error(entity.location(), 'duplicated declaration: ' + entity.name() + ' with ' + 
                 beforeEntity.location());
    }
    this._entities.set(entity.name(), entity);
  },
  
  /** Define variable or function globally. */
  defineEntity: function(entity) {
    var beforeEntity = this._entities.get(entity.name());
    if (beforeEntity && beforeEntity.isDefined()) {
      this.error(entity.location(), 'duplicated definition: ' + entity.name()  + ' with '+ 
                 beforeEntity.location());
    }
    this._entities.set(entity.name(), entity);
  },

  /** Searches and gets entity searching scopes upto ToplevelScope. */
  get: function(name, location) {
    if (this._entities.has(name)) {
      return this._entities.get(name);
    } else {
      this.error(location, 'unresolved reference: ' + name);
    }
  },

  /** Returns a list of all global variables.
   * "All global variable" means:
   *
   *    * has global scope
   *    * defined or undefined
   *    * public or private
   */
  allGlobalVariables: function() {
    var result = [] // Variable[]
    for (var ent of this._entities.values()) {
      if (ent instanceof Variable) {
        result.add(ent);
      }
    }
    result = result.concat(this.staticLocalVariables());
    return result;
  },

  definedGlobalScopeVariables: function() {
    var result = []; // DefinedVariable[]
    for (var ent of this._entities.values()) {
      if (ent instanceof DefinedVariable) {
        result.add(ent);
      }
    }
    result = result.concat(this.staticLocalVariables());
    return result;
  },

  staticLocalVariables: function() {
    if (this._staticLocalVariables === null) {
      this._staticLocalVariables = [];
      for (var s of this._children) {
        this._staticLocalVariables = this._staticLocalVariables.concat(s.staticLocalVariables());
      }
      var seqTable = new Map(); // String -> Number
      for (var v of this._staticLocalVariables) {
        var seq = seqTable.get(v.name());
        if (seq == null) {
          v.setSequence(0);
          seqTable.set(v.name(), 1);
        } else {
          v.setSequence(seq);
          seqTable.set(v.name(), seq + 1);
        }
      }
    }
    return this._staticLocalVariables;
  },

  checkReferences: function() {
    for (var ent of this._entities.values()) {
      if (ent.isDefined() && ent.isPrivate() &&
          !ent.isConstant() && !ent.isRefered()) {
        this.warn(ent.location(), "unused variable: " + ent.name());
      }
    }

    for (var funcScope of this._children)
      for (var s of funcScope._children)
        s.checkReferences();
  },

  warn: function(location, msg) {
    // console.log(location + ' ' + msg);
  },

  error: function(location, msg) {
    ErrorHandler.error('semantic error',
                       location.fileName(),
                       location.line(),
                       location.col(),
                       msg);
  }
});
