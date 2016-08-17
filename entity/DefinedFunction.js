var $extend = require('../util/extend');
var $import = require('../util/import');
var Func = require('./Func');
module.exports = DefinedFunction;

$extend(DefinedFunction, Func);
function DefinedFunction(priv, type, name, params, body) {
  // boolean priv, TypeNode type, String name, Params params, BlockNode body
  DefinedFunction.super.call(this, priv, type, name);
  this._params = params;
  this._body = body;
  this._scope; // LocalScope
  this._ir; // IR = Stmt[]
};

$import(DefinedFunction.prototype, {
  isDefined: function() {
    return true;
  },

  /**
   * @return {Array} // CBCParameter[]
   */
  
  parameters: function() {
    return this._params.parameters();
  },

  body: function() {
    return this._body;
  },

  ir: function() {
    return this._ir;
  },

  setIR: function(ir) {
    this._ir = ir;
  },

  setScope: function(scope) {
    this._scope = this.scope;
  },

  lvarScope: function() {
    return this.body().scope();
  },

  /**
   * @return {Array} // DefinedVariable
   * Returns function local variables.
   * Does NOT include paramters.
   * Does NOT include static local variables.
   */

  localVariables: function() {
    return this._scope.allLocalVariables();
  },
  // accept
});
