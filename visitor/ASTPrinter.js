var $extend = require('../util/extend');
var $import = require('../util/import');
var ASTVisitor = require('./ASTVisitor');
module.exports = ASTPrinter;

$extend(ASTPrinter, ASTVisitor);
function ASTPrinter() {
  this.str = "";
  this._indent = 0;
  this._indentSpace = 4;
}

$import(ASTPrinter.prototype, {
  print: function(ast) {
    this.tag('AST', ast.location());
    this.single('variables');
    this.in();
    this.printDefinedVariables(ast.definedVariables());
    this.out();
    this.single('functions');
    this.in();
    this.printDefinedFunctions(ast.definedFunctions());
    this.out();
    this.log();
  },

  printDefinedVariables: function(defvars) {
    for (var v of defvars) {
      this.tag('DefinedVariable', v.location());
    }
  },

  printDefinedFunctions: function(defuns) {
    for (var f of defuns) {
      this.tag('definedFunction', f.location());
    }
  },

  in: function() {
    this._indent += this._indentSpace;
  },

  out: function() {
    this._indent -= this._indentSpace;
  },

  indent: function() {
    for (var i = 0; i < this._indent; i++) {
      this.str += ' ';
    }
  },

  tag: function(name, location) {
    this.indent();
    this.str += '<<' + name + '>> (' + location.fileName() + ':' + location.line() + ')';
    this.str += '\n';
  },

  pair: function(first, second) {
    this.indent();
    this.str += first + ': ' + second;
    this.str += '\n';
  },

  single: function(first) {
    this.indent();
    this.str += first + ':';
    this.str += '\n';
  },

  log: function() {
    console.log(this.str);
  }
});
