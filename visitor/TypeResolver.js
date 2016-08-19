var $extend = require('../util/extend');
var $import = require('../util/import');
var ASTVisitor = require('./ASTVisitor');
var EntityVisitor = require('./EntityVisitor');
var DeclarationVisitor = require('./DeclarationVisitor');
var ErrorHandler = require('../util/ErrorHandler');
module.exports = TypeResolver;

$extend(TypeResolver, ASTVisitor);
function TypeResolver(typeTable) {
  // TypeTable typeTable
  this._typeTable = typeTable;
}

$import(TypeResolver.prototype, {
  resolve: function(ast) {
    this.defineTypes(ast.types());
    for (var t of ast.types()) {
      DeclarationVisitor.prototype.visit.call(this, t);
    }
    for (var ent of ast.entities()) {
      EntityVisitor.prototype.visit.call(this, ent);
    }
  },

  /**
   * @param {Array} deftypes // TypeDefinition[]
   */
  
  defineTypes: function(deftypes) {
    for (var def of deftypes) {
      if (this._typeTable.isDefined(def.typeRef())) {
        this.error(def.location(), 
                   "duplicated type definition: " + def.typeRef());
      } else {
        this._typeTable.put(def.typeRef(), def.definingType());
      }
    }
  },

  /**
   * @param {Object} n // TypeNode
   */

  bindType: function(n) {
    if (n.isResolved()) return;
    n.setType(this._typeTable.get(n.typeRef()));
  },

  //
  // Declarations
  //

  visitStructNode: function(struct) {
    this.resolveCompositeType(struct);
    return null;
  },

  visitUnionNode: function(union) {
    this.resolveCompositeType(union);
    return null;
  },

  /**
   * @param {Object} def // CompositeTypeDefinition
   */

  resolveCompositeType: function(def) {
    var ct = this._typeTable.get(def.typeNode().typeRef());
    if (ct == null) {
      this.error(def.location(), "cannot intern struct/union: " + def.name());
    }
    for (var s of ct.members()) {
      this.bindType(s.typeNode());
    }
  },

  visitTypedefNode: function(typedef) {
    this.bindType(typedef.typeNode());
    this.bindType(typedef.realTypeNode());
    return null;
  },

  //
  // Entities
  //

  visitDefinedVariable: function(v) {
    this.bindType(v.typeNode());
    if (v.hasInitializer()) {
      this.visit(v.initializer());
    }
    return null;
  },

  visitUndefinedVariable: function(v) {
    this.bindType(v.typeNode());
    return null;
  },

  visitConstant: function(c) {
    this.bindType(c.typeNode());
    this.visit(c.value());
    return null;
  },

  visitDefinedFunction: function(func) {
    this.resolveFunctionHeader(func);
    this.visit(func.body());
    return null;
  },

  visitUndefinedFunction: function(func) {
    this.resolveFunctionHeader(func);
    return null;
  },

  resolveFunctionHeader: function(func) {
    this.bindType(func.typeNode());
    for (var param of func.parameters()) {
      // arrays must be converted to pointers in a function parameter.
      var t = this._typeTable.getParamType(param.typeNode().typeRef());
      param.typeNode().setType(t);
    }
  },

  //
  // Expressions
  //

  visitBlockNode: function(node) {
    for (var v of node.variables()) {
      this.visitDefinedVariable(v);
    }
    this.visitStmts(node.stmts());
    return null;
  },

  visitCastNode: function(node) {
    this.bindType(node.typeNode());
    TypeResolver.super.prototype.visitCastNode.call(this, node);
    return null;
  },

  visitSizeofExprNode: function(node) {
    this.bindType(node.typeNode());
    TypeResolver.super.prototype.visitSizeofExprNode.call(this, node);
      return null;
  },

  visitSizeofTypeNode: function(node) {
    this.bindType(node.operandTypeNode());
    this.bindType(node.typeNode());
    TypeResolver.super.prototype.visitSizeofTypeNode.call(this, node);
    return null;
  },

  visitIntegerLiteralNode: function(node) {
    this.bindType(node.typeNode());
    return null;
  },

  visitStringLiteralNode: function(node) {
    this.bindType(node.typeNode());
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
