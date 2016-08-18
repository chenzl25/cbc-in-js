var $extend = require('../util/extend');
var $import = require('../util/import');
var Variable = require('./Variable');
var TypeNode = require('../ast/TypeNode');
module.exports = DefinedVariable;

$extend(DefinedVariable, Variable);
function DefinedVariable(priv, type, name, init) {
  // boolean priv, TypeNode type, String name
  DefinedVariable.super.call(this, priv, type, name);
  this._initializer = init; // ExprNode
  this._sequence = -1; // Number
  this._symbol; // Symbol
  this._ir;     // Expr
};

DefinedVariable.tmpSeq = 0;

DefinedVariable.tmp = function(t /*Type*/) {
  return new DefinedVariable(false, new TypeNode(t), 
            "@tmp" + DefinedVariable.tmpSeq++, null);
}

$import(DefinedVariable.prototype, {
  isDefined: function() {
    return true;    
  },

  setSequence: function(seq) {
    this._sequence = seq;
  },

  symbolString: function() {
    return (this._sequence < 0) ? this._name: this._name + '.' + this._sequence;
  },

  hasInitializer: function() {
    return this._initializer != null;
  },

  isInitialized: function() {
    return this.hasInitializer();
  },

  initializer: function() {
    return this._initializer;
  },

  setInitializer: function(expr) {
    this._initializer = expr;
  },

  setIR: function(expr) {
    this._ir = expr;
  },

  ir: function() {
    return this._ir;
  },
  //accept
});

