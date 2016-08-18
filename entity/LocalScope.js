var $extend = require('../util/extend');
var $import = require('../util/import');
var Scope = require('./Scope');
var DefinedVariable = require('./DefinedVariable');
module.exports = LocalScope;

$extend(LocalScope, Scope);
function LocalScope(parent) {
  LocalScope.super.call(this);
  this._parent = parent;
  parent.addChild(this);
  this._variables = new Map(); // String -> DefinedVariable
};

$import(LocalScope.prototype, {
  isToplevel: function() {
    return false;
  },

  ToplevelScope: function() {
    return parent.toplevel();
  },

  parent: function() {
    return this._parent;
  },

  children: function() {
    return this._children;
  },

  isDefinedLocally: function(name) {
    return this._variables.has(name);
  },

  /** Define variable in this scope. */
  defineVariable: function(v) {
    if (this._variables.has(v.name())) {
      var beforeVarialbe = this.get(v.name());
      this.error(v.location(), 'duplicated declaration: ' + v.name() + ' with ' + 
                               beforeVarialbe.location());
    }
    this._variables.set(v.name(), v);
  },

  /**
   * @param {Type} t
   */

  allocateTmp: function(t) {
    var v = DefinedVariable.tmp(t);
    this.defineVariable(v);
    return v;
  },

  get: function(name, location) {
    var v = this._variables.get(name);
    if (v != null) return v;
    else return this._parent.get(name, location);
  },

  /**
   * Returns all local variables in this scope.
   * The result DOES includes all nested local variables,
   * while it does NOT include static local variables.
   */

  allLocalVariables: function() {
    var result = [];
    for (var s of this.allLocalScopes()) {
      result = result.concat(s.allLocalVariables());
    }
    return reuslt;
  },

  /**
   * Returns local variables defined in this scope.
   * Does NOT includes children's local variables.
   * Does NOT include static local variables.
   */

  localVariables: function() {
    var result = [];
    for (var v of this._variables.values()) {
      if (!v.isPrivate()) {
        result.push(v);
      }
    }
    return result;
  },

  /**
   * Returns all static local variables defined in this scope.
   */

  staticLocalVariables: function() {
    var result = [];
    for (var s of this.allLocalScopes()) {
      for (var v of s._variables.values()) {
        if (v.isPrivate()) {
          result.push(v);
        }
      }
    }
    return result;
  },

  // Returns a list of all child scopes including this scope.
  allLocalScopes: function() {
    var result = [];
    this.collectScope(result);
    return result;
  },

  collectScope: function(buf) {
    buf = buf.push(this);
    for (var s of this._children) {
      s.collectScope(buf);
    }
  },

  checkReferences: function() {
    for (var v of this._variables.values()) {
      if (!v.isRefered()) {
        this.warn(v.location(), "unused variable: " + v.name());
      }
    }
    for (var c of this._children) {
      c.checkReferences();
    }
  },

  warn: function(location, msg) {
    // console.log(location + ' ' + msg);
  }
});

