var $extend = require('../util/extend');
var $import = require('../util/import');
var Entity = require('./Entity');
var Label = require('../asm/Label');
module.exports = Func;

$extend(Func, Entity);
function Func(priv, t, name) {
  // boolean priv, TypeNode t, String name
  Func.super.call(this, priv, t, name);
  this._callingSymbol; // Symbol
  this._label; // Label
};

$import(Func.prototype, {
  isInitialized: function() {
    return true;
  },

  isDefined: function() {
    throw new Error('Func abstract method call: isDefined');
  },

  /**
   * @return {Array} // CBCParameter[]
   */

  parameters: function() {
    throw new Error('Func abstract method call: parameters');
  },

  returnType: function() {
    return this.type().getFunctionType().returnType();
  },

  isVoid: function() {
    return this.returnType().isVoid();
  },

  /**
   * @param {Object} sym // Symbol
   */

  setCallingSymbol: function(sym) {
    if (this._callingSymbol != null) {
      if (this._callingSymbol.name() === sym.name()) return; // fix `node test` will set again
      throw new Error("must not happen: Function#callingSymbol was set again");
    }
    this._callingSymbol = sym;
  },
  
  /**
   * @return {Object} // Symbol
   */

  callingSymbol: function() {
    if (this._callingSymbol == null) {
      throw new Error("must not happen: Function#callingSymbol called but null");
    }
    return this._callingSymbol;
  },

  label: function() {
    if (this._label != null) {
      return this._label;
    } else {
      return this._label = new Label(this.callingSymbol());
    }
  }
});
