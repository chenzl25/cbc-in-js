module.exports = Declarations;

function Declarations() {
  this._defvars = [];   // DefinedVariable
  this._vardecls = [];  // UndefinedVariable
  this._defuns = [];    // DefinedFunction
  this._funcdecls = []; // UndefinedFunction
  this._constants = []; // Constant
  this._defstructs = [];// StructNode
  this._defunions = []; // UnionNode
  this._typedefs = [];  // TypedefNode
};

Declarations.prototype = {
  add: function(decls) {
    this._defvars = this._defvars.concat(decls.defvars());
    this._vardecls = this._vardecls.concat(decls.vardecls());
    this._funcdecls = this._funcdecls.concat(decls.funcdecls());
    this._constants = this._constants.concat(decls.constants());
    this._defstructs = this._defstructs.concat(decls.defstructs());
    this._defunions = this._defunions.concat(decls.defunions());
    this._typedefs = this._typedefs.concat(decls.typedefs());
  },

  addDefvar: function(v) {
    this._defvars.push(v);
  },

  addDefvars: function(vs) {
    this._defvars = this._defvars.concat(vs);
  },

  defvars: function() {
    return this._defvars;
  },

  addVardecl: function(v) {
    this._vardecls.push(v);
  },

  vardecls: function() {
    return this._vardecls;
  },

  addConstant: function(c) {
    this._constants.push(c);
  },

  constants: function() {
    return this._constants;
  },

  addDefun: function(c) {
    this._defuns.push(c);
  },

  defuns: function() {
    return this._defuns;
  },

  addFuncdecl: function(func) {
    this._funcdecls.push(func);
  },

  funcdecls: function() {
    return this._funcdecls;
  },

  addDefstruct: function(n) {
    this._defstructs.push(n);
  },

  defstructs: function() {
    return this._defstructs;
  },

  addDefunion: function(n) {
    this._defunions.push(n);
  },

  defunions: function() {
    return this._defunions;
  },

  addTypedef: function(n) {
    this._typedefs.push(n);
  },

  typedefs: function() {
    return this._typedefs;
  }
}

