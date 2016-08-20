var $extend = require('../util/extend');
var $import = require('../util/import');
var ASTVisitor = require('./ASTVisitor');
var UserType = require('../type/UserType');
var ErrorHandler = require('../util/ErrorHandler');
module.exports = DereferenceChecker;

$extend(DereferenceChecker, ASTVisitor);
function DereferenceChecker(typeTable) {
  // TypeTable typeTable
  this._typeTable = typeTable;
  this._errorHandler = new ErrorHandler();
}

$import(DereferenceChecker.prototype, {
  check: function(ast) {
    try {
      for (var v of ast.definedVariables()) {
        this.checkToplevelVariable(v);
      }
      for (var f of ast.definedFunctions()) {
        this.visit(f.body());
      }
    } catch (err) {
      // some err cause by the errors unhandled before
    } finally {
      if (this._errorHandler.hasError()) {
        this._errorHandler.throw();
      }
    }
  },

  /**
   * @param {Object} v // DefinedVariable
   */
  
  checkToplevelVariable: function(v) {
    this.checkVariable(v);
    if (v.hasInitializer()) {
      this.checkConstant(v.initializer());
    }
  },

  checkConstant: function(expr) {
    if (! expr.isConstant()) {
      this.error(expr.location(), "not a constant");
    }
  },

  //
  // Statements
  //

  visitBlockNode: function(node) {
    for (var v of node.variables()) {
      this.checkVariable(v);
    }
    this.visitStmts(node.stmts());
    return null;
  },

  checkVariable: function(v) {
    if (v.hasInitializer()) {
      this.visit(v.initializer());
    }
  },

  //
  // Assignment Expressions
  //

  visitAssignNode: function(node) {
    DereferenceChecker.super.prototype.visitAssignNode.call(this, node);
    this.checkAssignment(node);
    return null;
  },

  visitOpAssignNode: function(node) {
    DereferenceChecker.super.prototype.visitOpAssignNode.call(this, node);
    this.checkAssignment(node);
    return null;
  },

  // AbstractAssignNode
  checkAssignment: function(node) {
    if (! node.lhs().isAssignable()) {
      this.error(node.location(), "invalid lhs expression");
    }
  },

  //
  // Expressions
  //

  visitPrefixOpNode: function(node) {
    DereferenceChecker.super.prototype.visitPrefixOpNode.call(this, node);
    if (! node.expr().isAssignable()) {
      this.error(node.expr().location(), "cannot increment/decrement");
    }
    return null;
  },

  visitSuffixOpNode: function(node) {
    DereferenceChecker.super.prototype.visitSuffixOpNode.call(this, node);
    if (! node.expr().isAssignable()) {
      this.error(node.expr().location(), "cannot increment/decrement");
    }
    return null;
  },

  visitFuncallNode: function(node) {
    DereferenceChecker.super.prototype.visitFuncallNode.call(this, node);
    if (! node.expr().isCallable()) {
      this.error(node.location(), "calling object is not a function");
    }
    return null;
  },

  visitArefNode: function(node) {
    DereferenceChecker.super.prototype.visitArefNode.call(this, node);
    if (! node.expr().isPointer()) {
      this.error(node.location(), "indexing non-array/pointer expression");
    }
    this.handleImplicitAddress(node);
    return null;
  },

  visitMemberNode: function(node) {
    DereferenceChecker.super.prototype.visitMemberNode.call(this, node);
    this.checkMemberRef(node.location(), node.expr().type(), node.member());
    this.handleImplicitAddress(node);
    return null;
  },

  visitPtrMemberNode: function(node) {
    DereferenceChecker.super.prototype.visitPtrMemberNode.call(this, node);
    if (! node.expr().isPointer()) {
      this.error(node.location(), "dereferencing non-pointer expression");
    }
    this.checkMemberRef(node.location(), node.dereferedType(), node.member());
    this.handleImplicitAddress(node);
    return null;
  },

  checkMemberRef: function(loc, t, memb) {
    // Location loc, Type t, String memb
    if (! t.isCompositeType()) {
      this.error(loc, "accessing member `" + memb
                        + "' for non-struct/union: " + t)
    }
    var type = t.getCompositeType();
    if (! type.hasMember(memb)) {
      this.error(loc, type.toString() + " does not have member: " + memb);
    }
  },

  visitDereferenceNode: function(node) {
    DereferenceChecker.super.prototype.visitDereferenceNode.call(this, node);
    if (! node.expr().isPointer()) {
      this.error(node.location(), "dereferencing non-pointer expression");
    }
    this.handleImplicitAddress(node);
    return null;
  },

  visitAddressNode: function(node) {
    DereferenceChecker.super.prototype.visitAddressNode.call(this, node);
    if (! node.expr().isLvalue()) {
      this.error(node.location(), "invalid expression for &");
    }
    var base = node.expr().type();
    if (! node.expr().isLoadable()) {
      // node.expr.type is already pointer. like: &func still a pointer
      node.setType(base);
    } else {
      node.setType(this._typeTable.pointerTo(base));
    }
    return null;
  },

  visitVariableNode: function(node) {
    DereferenceChecker.super.prototype.visitVariableNode.call(this, node);
    if (node.entity().isConstant()) {
      this.checkConstant(node.entity().value());
    }
    this.handleImplicitAddress(node);
    return null;
  },

  visitCastNode: function(node) {
    DereferenceChecker.super.prototype.visitCastNode.call(this, node);
    if (node.type().isArray()) {
      this.error(node.location(), "cast specifies array type");
    }
    return null;
  },

  //
  // Utilities
  //

  /**
   * @param {Object} node // LHSNode
   */
  
  handleImplicitAddress: function(node) {
    if (! node.isLoadable()) {
      var t = node.type();
      if (t.isArray()) {
        // int[4] ary; ary; should generate int*
        node.setType(this._typeTable.pointerTo(t.baseType()));
      } else {
        node.setType(this._typeTable.pointerTo(t));
      }
    }
  },

  error: function(location, msg) {
    this._errorHandler.collect('semantic error',
                       location.fileName(),
                       location.line(),
                       location.col(),
                       msg);
  }
});

