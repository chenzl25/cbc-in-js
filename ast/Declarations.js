module.exports = Declarations;

function Declarations() {
  this._defvars = new Set();   // DefinedVariable
  this._vardecls = new Set();  // UndefinedVariable
  this._defuns = new Set();    // DefinedFunction
  this._funcdecls = new Set(); // UndefinedFunction
  this._constants = new Set(); // Constant
  this._defstructs = new Set();// StructNode
  this._defunions = new Set(); // UnionNode
  this._typedefs = new Set();  // TypedefNode
};

Declarations.prototype = {
  add: function(decls) {
    for (var tmp of decls.defvars()) this._defvars.add(tmp);
    for (var tmp of decls.vardecls()) this._vardecls.add(tmp);
    for (var tmp of decls.funcdecls()) this._funcdecls.add(tmp);
    for (var tmp of decls.constants()) this._constants.add(tmp);
    for (var tmp of decls.defstructs()) this._defstructs.add(tmp);
    for (var tmp of decls.defunions()) this._defunions.add(tmp);
    for (var tmp of decls.typedefs()) this._typedefs.add(tmp);
  },

  addDefvar: function(v) {
    this._defvars.add(v);
  },

  addDefvars: function(vs) {
    for (var v of vs) {
      this.addDefvar(v);
    }
  },

  defvars: function() {
    return Array.from(this._defvars);
  },

  addVardecl: function(v) {
    this._vardecls.add(v);
  },

  vardecls: function() {
    return Array.from(this._vardecls);
  },

  addConstant: function(c) {
    this._constants.add(c);
  },

  constants: function() {
    return Array.from(this._constants);
  },

  addDefun: function(c) {
    this._defuns.add(c);
  },

  defuns: function() {
    return Array.from(this._defuns);
  },

  addFuncdecl: function(func) {
    this._funcdecls.add(func);
  },

  funcdecls: function() {
    return Array.from(this._funcdecls);
  },

  addDefstruct: function(n) {
    this._defstructs.add(n);
  },

  defstructs: function() {
    return Array.from(this._defstructs);
  },

  addDefunion: function(n) {
    this._defunions.add(n);
  },

  defunions: function() {
    return Array.from(this._defunions);
  },

  addTypedef: function(n) {
    this._typedefs.add(n);
  },

  typedefs: function() {
    return Array.from(this._typedefs);
  }
}

