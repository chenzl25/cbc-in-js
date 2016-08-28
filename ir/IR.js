module.exports = IR;

/**
 *
 * @param {Object} source        // Location
 * @param {Array}  defvars       // DefinedVariable
 * @param {Array}  defuns        // DefinedFunction
 * @param {Array}  funcdecls     // UndefinedFunction
 * @param {Object} scope         // ToplevelScope
 * @param {Object} constantTable // ConstantTable
 * @param {Array}  gvars         // gvars
 * @param {Array}  comms         // cache
 *
 */

function IR(source, defvars, defuns, funcdecls, scope, constantTable) {
  this._source = source;
  this._defvars = defvars;
  this._defuns = defuns;
  this._funcdecls = funcdecls;
  this._scope = scope;
  this._constantTable = constantTable;
  this._gvars;
  this._comms;
};

IR.prototype = {
  fileName: function() {
    return this._source.fileName();
  },

  location: function() {
    return this._source;
  },

  definedVariables: function() {
    return this._defvars;
  },

  isFunctionDefined: function() {
    return this._defuns.length !== 0;
  },

  definedFunctions: function() {
    return this._defuns;
  },

  scope: function() {
    return this._scope; // ToplevelScope
  },

  allFunctions: function() {
    var result = [];
    result = result.concat(this._defuns);
    result = result.concat(this._funcdecls);
    return result;
  },

  /** a list of all defined/declared global-scope variables */
  allGlobalVariables: function() {
    return this._scope.allGlobalVariables();
  },

  isGlobalVariableDefined: function() {
    return this.definedGlobalVariables().length !== 0;
  },

  /** Returns the list of global variables.
   *  A global variable is a variable which has
   *  global scope and is initialized.  */
  definedGlobalVariables: function() {
      if (this._gvars == null) {
        this.initVariables();
      }
      return this._gvars;
  },

  isCommonSymbolDefined: function() {
      return this.definedCommonSymbols().length !== 0;
  },

  /** Returns the list of common symbols.
   *  A common symbol is a variable which has
   *  global scope and is not initialized.  */
  definedCommonSymbols: function() {
    if (this._comms == null) {
      this.initVariables();
    }
    return this._comms;
  },

  initVariables: function() {
      this._gvars = [];
      this._comms = [];
      for (var v of this._scope.definedGlobalScopeVariables()) {
          (v.hasInitializer() ? this._gvars : this._comms).push(v);
      }
  },

  isStringLiteralDefined: function() {
    return ! this._constantTable.isEmpty();
  },

  constantTable: function() {
    return this._constantTable;
  },
};