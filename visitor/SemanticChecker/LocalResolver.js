var $extend = require('../../util/extend');
var $import = require('../../util/import');
var ASTVisitor = require('../AbstractVisitor/ASTVisitor');
var ErrorHandler = require('../../util/ErrorHandler');
var ConstantTable = require('../../entity/ConstantTable');
var ToplevelScope = require('../../entity/ToplevelScope');
var LocalScope = require('../../entity/LocalScope');
module.exports = LocalResolver;

$extend(LocalResolver, ASTVisitor);
function LocalResolver() {
  this._scopeStack = []; // Scope[]
  this._constantTable = new ConstantTable();
}

$import(LocalResolver.prototype, {
  resolve: function(ast) {
    var toplevel = new ToplevelScope();
    this._scopeStack.push(toplevel);
    for (var decl of ast.declarations()) {
      toplevel.declareEntity(decl);
    }
    for (var ent of ast.definitions()) {
      toplevel.defineEntity(ent);
    }
    this.resolveGvarInitializers(ast.definedVariables());
    this.resolveConstantValues(ast.constants());
    this.resolveFunctions(ast.definedFunctions());
    toplevel.checkReferences();
    ast.setScope(toplevel);
    ast.setConstantTable(this._constantTable);
  },


  resolveGvarInitializers: function(gvars) {
    for (var gvar of gvars) {
      if (gvar.hasInitializer()) {
        this.visit(gvar.initializer());
      }
    }
  },

  resolveConstantValues(consts) {
    for (var c of consts) {
      this.visit(c.value());
    }
  },
  
  resolveFunctions: function(funcs) {
    for (var func of funcs) {
      this.pushScope(func.parameters());
      this.visit(func.body());
      func.setScope(this.popScope());
    }
  },

  visitBlockNode: function(node) {
    this.pushScope(node.variables());
    LocalResolver.super.prototype.visitBlockNode.call(this, node);
    node.setScope(this.popScope());
    return null;
  },
  
  // DefinedVariable[]
  pushScope: function(vars) {
    var scope = new LocalScope(this.currentScope());
    for (var v of vars) {
      if (scope.isDefinedLocally(v.name())) {
        var beforeVarialbe = scope.get(v.name());
        this.error(v.location(), "duplicated variable in scope: " + v.name() + ' with ' + 
                               beforeVarialbe.location());
      } else {
        scope.defineVariable(v);
      }
    }
    this._scopeStack.push(scope);
  },

  popScope: function() {
    return this._scopeStack.pop();
  },

  currentScope: function() {
    return this._scopeStack[this._scopeStack.length-1];
  },

  visitStringLiteralNode: function(node) {
    node.setEntry(this._constantTable.intern(node.value()));
  },

  visitVariableNode: function(node) {
    var ent = this.currentScope().get(node.name(), node.location());
    ent.refered();
    node.setEntity(ent);
    return null;
  },

  error: function(location, msg) {
    ErrorHandler.error('semantic error', 
                       location.fileName(),
                       location.line(),
                       location.col(),
                       msg);
  }
});

