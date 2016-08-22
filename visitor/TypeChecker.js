var $extend = require('../util/extend');
var $import = require('../util/import');
var ASTVisitor = require('./ASTVisitor');
var ErrorHandler = require('../util/ErrorHandler');
var CastNode = require('../ast/CastNode');
var IntegerLiteralNode = require('../ast/IntegerLiteralNode');
module.exports = TypeChecker;

$extend(TypeChecker, ASTVisitor);
function TypeChecker(typeTable) {
  // TypeTable typeTable
  this._typeTable = typeTable;
  this._errorHandler = new ErrorHandler();
  this._currentFunction; // DefinedFunction
}

$import(TypeChecker.prototype, {
  check: function(ast) {
    try {
      for (var v of ast.definedVariables()) {
        this.checkVariable(v);
      }
      for (var f of ast.definedFunctions()) {
        this._currentFunction = f;
        this.checkReturnType(f);
        this.checkParamTypes(f);
        this.visit(f.body());
      }
    } catch (err) {
      if (!this._errorHandler.hasError()) {
        // bug will come here
        console.log('TypeChecker bug!')
        console.log(err);
        console.log(err.stack)
      }
    } finally {
      if (this._errorHandler.hasError()) {
        // some err cause by the errors unhandled before
        this._errorHandler.throw();
      }
    }
  },

  /**
   * @param {Object} f // DefinedFunction
   */
  
  checkReturnType: function(f) {
    if (this.isInvalidReturnType(f.returnType())) {
      this.error(f.location(), "returns invalid type: " + f.returnType());
    }
  },
  
  /**
   * @param {Object} f // DefinedFunction
   */

  checkParamTypes: function(f) {
    for (var param of f.parameters()) {
      if (this.isInvalidParameterType(param.type())) {
        this.error(param.location(), "invalid parameter type: " + param.type());
      }
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
    if (this.isInvalidVariableType(v.type())) {
      this.error(v.location(), "invalid variable type");
      return;
    }
    if (v.hasInitializer()) {
      if (this.isInvalidLHSType(v.type())) {
        this.error(v.location(), "invalid LHS type: " + v.type());
        return;
      }
      this.visit(v.initializer());
      v.setInitializer(this.implicitCast(v.type(), v.initializer()));
    }
  },

  visitExprStmtNode: function(node) {
    this.visit(node.expr());
    if (this.isInvalidStatementType(node.expr().type())) {
      this.error(node.location(), "invalid statement type: " + node.expr().type());
    }
    return null;
  },

  visitIfNode: function(node) {
    TypeChecker.super.prototype.visitIfNode.call(this, node);
    this.checkCond(node.cond());
    return null;
  },

  visitWhileNode: function(node) {
    TypeChecker.super.prototype.visitWhileNode.call(this, node);
    this.checkCond(node.cond());
    return null;
  },

  visitForNode: function(node) {
    TypeChecker.super.prototype.visitForNode.call(this, node);
    this.checkCond(node.cond());
    return null;
  },

  /**
   * @param {Obejct} cond // ExprNode
   */

  checkCond: function(cond) {
    this.mustBeScalar(cond, "condition expression");
  },

  visitSwitchNode: function(node) {
    TypeChecker.super.prototype.visitSwitchNode.call(this, node);
    this.mustBeInteger(node.cond(), "condition expression");
    return null;
  },

  visitReturnNode: function(node) {
    TypeChecker.super.prototype.visitReturnNode.call(this, node);
    if (this._currentFunction.isVoid()) {
      if (node.expr() != null) {
        this.error(node.location(), "returning value from void function");
      }
    } else {  // non-void function
      if (node.expr() == null) {
        this.error(node.location(), "missing return value");
        return null;
      }
      if (node.expr().type().isVoid()) {
        this.error(node, "returning void");
        return null;
      }
      node.setExpr(this.implicitCast(this._currentFunction.returnType(),
                                     node.expr()));
    }
    return null;
  },

  //
  // Assignment Expressions
  //
  
  visitAssignNode: function(node) {
    TypeChecker.super.prototype.visitAssignNode.call(this, node);
    if (! this.checkLHS(node.lhs())) return null;
    if (! this.checkRHS(node.rhs())) return null;
    node.setRHS(this.implicitCast(node.lhs().type(), node.rhs()));
    return null;
  },

  visitOpAssignNode: function(node) {
    TypeChecker.super.prototype.visitOpAssignNode.call(this, node);
    if (! this.checkLHS(node.lhs())) return null;
    if (! this.checkRHS(node.rhs())) return null;
    if (node.operator() === '+' || node.operator() === '-') {
      if (node.lhs().type().isPointer()) {
        this.mustBeInteger(node.rhs(), node.operator());
        node.setRHS(this.integralPromotedExpr(node.rhs()));
        return null;
      }
    }
    if (! this.mustBeInteger(node.lhs(), node.operator())) return null;
    if (! this.mustBeInteger(node.rhs(), node.operator())) return null;
    var l = this.integralPromotion(node.lhs().type());
    var r = this.integralPromotion(node.rhs().type());
    var opType = this.usualArithmeticConversion(l, r);
    if (!opType.isCompatible(l) && !isSafeIntegerCast(node.rhs(), opType)) {
      this.warn(node.location(), "incompatible implicit cast from " 
                                 + opType + " to " + l);
    }
    if (! r.isSameType(opType)) {
      node.setRHS(new CastNode(opType, node.rhs()));
    }
    return null;
  },

  /** allow safe implicit cast from integer literal like:
   *
   *    char c = 0;
   *
   *  "0" has a type integer, but we can cast (int)0 to (char)0 safely.
   */
  
  isSafeIntegerCast: function(node, type) {
    // Node node, Type type
    if (! type.isInteger()) return false;
    if (! (node instanceof IntegerLiteralNode)) return false;
    return type.isInDomain(node.value());
  },

  checkLHS: function(lhs) {
    if (lhs.isParameter()) {
      // parameter is always assignable.
      return true;
    } else if (this.isInvalidLHSType(lhs.type())) {
      this.error(lhs, "invalid LHS expression type: " + lhs.type());
      return false;
    }
    return true;
  },

  //
  // Expressions
  //

  visitCondExprNode: function(node) {
    TypeChecker.super.prototype.visitCondExprNode.call(this, node);
    this.checkCond(node.cond());
    var t = node.thenExpr().type();
    var e = node.elseExpr().type();
    if (thenExpr.isSameType(elseExpr)) {
      return null;
    } else if (t.isCompatible(e)) { // insert cast on thenBody
      node.setThenExpr(new CastNode(e, node.thenExpr()));
    } else if (e.isCompatible(t)) { // insert cast on elseBody
      node.setElseExpr(new CastNode(t, node.elseExpr()));
    } else {
      this.invalidCastError(t.location(), e, t)
    }
    return null;
  },

  visitBinaryOpNode: function(node) {
    TypeChecker.super.prototype.visitBinaryOpNode.call(this, node);
    if (node.operator() === '+' || node.operator() === '-') {
      this.expectsSameIntegerOrPointerDiff(node);
    }
    else if (node.operator() === '*'
            || node.operator() === '/'
            || node.operator() === '%'
            || node.operator() === '&'
            || node.operator() === '|'
            || node.operator() === '^'
            || node.operator() === '<<'
            || node.operator() === '>>') {
      this.expectsSameInteger(node);
    } else if (node.operator() === '=='
            || node.operator() === '!='
            || node.operator() === '<'
            || node.operator() === '<='
            || node.operator() === '>'
            || node.operator() === '>=') {
      this.expectsComparableScalars(node);
    } else {
      throw new Error("unknown binary operator: " + node.operator());
    }
    return null;
  },

  visitLogicalAndNode: function(node) {
    TypeChecker.super.prototype.visitLogicalAndNode.call(this, node);
    this.expectsComparableScalars(node);
    return null;
  },

  visitLogicalOrNode: function(node) {
    TypeChecker.super.prototype.visitLogicalOrNode.call(this, node);
    this.expectsComparableScalars(node);
    return null;
  },

  /**
   * For + and -, only following types of expression are valid:
   *
   *   * integer + integer
   *   * pointer + integer
   *   * integer + pointer
   *   * integer - integer
   *   * pointer - integer
   *   * pointer - pointer
   */

  // node: BinaryOpNode
  expectsSameIntegerOrPointerDiff: function(node) {
    if (node.left().isPointer() && node.right().isPointer()) {
      if (node.operator() === '+') {
        this.error(node, "invalid operation: pointer + pointer");
        return;
      }
      node.setType(this._typeTable.ptrDiffType());
    }
    else if (node.left().isPointer()) {
      this.mustBeInteger(node.right(), node.operator());
      // promote integer for pointer calculation
      node.setRight(this.integralPromotedExpr(node.right()));
      node.setType(node.left().type());
    }
    else if (node.right().isPointer()) {
      if (node.operator() === '-') {
        this.error(node, "invalid operation: integer - pointer");
        return;
      }
      this.mustBeInteger(node.left(), node.operator());
      // promote integer for pointer calculation
      node.setLeft(this.integralPromotedExpr(node.left()));
      node.setType(node.right().type());
    }
    else {
      this.expectsSameInteger(node);
    }
  },

  integralPromotedExpr: function(expr) {
    var t = this.integralPromotion(expr.type());
    if (t.isSameType(expr.type())) {
      return expr;
    } else {
      return new CastNode(t, expr);
    }
  },

  // +, -, *, /, %, &, |, ^, <<, >>
  expectsSameInteger: function(node) {
    // node: BinaryOpNode 
    if (! this.mustBeInteger(node.left(), node.operator())) return;
    if (! this.mustBeInteger(node.right(), node.operator())) return;
    this.arithmeticImplicitCast(node);
  },

  // ==, !=, >, >=, <, <=, &&, ||
  expectsComparableScalars: function(node) {
    // node: BinaryOpNode 
    if (! this.mustBeScalar(node.left(), node.operator())) return;
    if (! this.mustBeScalar(node.right(), node.operator())) return;
    if (node.left().type().isPointer()) {
      var right = this.forcePointerType(node.left(), node.right());
      node.setRight(right);
      node.setType(node.left().type());
      return;
    }
    if (node.right().type().isPointer()) {
      var left = this.forcePointerType(node.right(), node.left());
      node.setLeft(left);
      node.setType(node.right().type());
      return;
    }
    this.arithmeticImplicitCast(node);
  },
  
  // cast slave node to master node.
  forcePointerType: function(master, slave) {
    // master, slave: ExprNode
    if (master.type().isCompatible(slave.type())) {
      // needs no cast
      return slave;
    } else {
      this.warn(slave.location(), "incompatible implicit cast from "
                                  + slave.type() + " to " + master.type());
      return new CastNode(master.type(), slave);
    }
  },

  // Processes usual arithmetic conversion for binary operations.
  arithmeticImplicitCast: function(node) {
    // node: BinaryOpNode
    var r = this.integralPromotion(node.right().type());
    var l = this.integralPromotion(node.left().type());
    var target = this.usualArithmeticConversion(l, r);
    if (! l.isSameType(target)) {
      // insert cast on left expr
      node.setLeft(new CastNode(target, node.left()));
    }
    if (! r.isSameType(target)) {
      // insert cast on right expr
      node.setRight(new CastNode(target, node.right()));
    }
    node.setType(target);
  },
  // +, -, !, ~
  visitUnaryOpNode: function(node) {
    TypeChecker.super.prototype.visitUnaryOpNode.call(this, node);
    if (node.operator() === '!') {
      this.mustBeScalar(node.expr(), node.operator());
    } else {
      this.mustBeInteger(node.expr(), node.operator());
    }
    return null;
  },

  // ++x, --x
  visitPrefixOpNode: function(node) {
    TypeChecker.super.prototype.visitPrefixOpNode.call(this, node);
    this.expectsScalarLHS(node);
    return null;
  },

  // x++, x--
  visitSuffixOpNode: function(node) {
    TypeChecker.super.prototype.visitSuffixOpNode.call(this, node);
    this.expectsScalarLHS(node);
    return null;
  },

  expectsScalarLHS: function(node) {
    // node: UnaryArithmeticOpNode
    if (node.expr().isParameter()) {
      // parameter is always a scalar.
    } else if (node.expr().type().isArray()) {
      // We cannot modify non-parameter array.
      this.wrongTypeError(node.expr(), node.operator());
      return;
    } else {
      this.mustBeScalar(node.expr(), node.operator());
    }
    if (node.expr().type().isInteger()) {
      var opType = this.integralPromotion(node.expr().type());
      if (! node.expr().type().isSameType(opType)) {
        node.setOpType(opType);
      }
      node.setAmount(1);
    } else if (node.expr().type().isPointer()) {
      if (node.expr().type().baseType().isVoid()) {
        // We cannot increment/decrement void*
        this.wrongTypeError(node.expr(), node.operator());
        return;
      }
      node.setAmount(node.expr().type().baseType().size());
    } else {
      throw new Error("must not happen");
    }
  },

  /**
   * For EXPR(ARG), checks:
   *
   *   * The number of argument matches function prototype.
   *   * ARG matches function prototype.
   *   * ARG is neither a struct nor an union.
   */

  visitFuncallNode: function(node) {
    TypeChecker.super.prototype.visitFuncallNode.call(this, node);
    var type = node.functionType();
    if (! type.acceptsArgc(node.numArgs())) {
      this.error(node.location(), "wrong number of argments: " + node.numArgs());
      return null;
    }
    var args = node.args();
    var newArgs = []; // ExprNode[]
    var paramTypes = type.paramTypes();
    // mandatory args
    for (var i = 0; i < paramTypes.length; i++) {
      newArgs.push(this.checkRHS(args[i]) ? this.implicitCast(paramTypes[i], args[i]) : args[i]);
    }
    // optional args
    if (args.length > paramTypes.length) {
      for (var i = paramTypes.length; i < args.length; i++) {
        newArgs.push(this.checkRHS(args[i]) ? this.castOptionalArg(args[i]) : args[i]);
        
      }
    }
    node.replaceArgs(newArgs);
    return null;
  },

  castOptionalArg: function(arg) {
    // arg: ExprNode 
    if (! arg.type().isInteger()) {
      return arg;
    }
    var t = arg.type().isSigned()
        ? this._typeTable.signedStackType()
        : this._typeTable.unsignedStackType();
    return arg.type().size() < t.size() ? this.implicitCast(t, arg) : arg;
  },

  visitArefNode: function(node) {
    TypeChecker.super.prototype.visitArefNode.call(this, node);
    this.mustBeInteger(node.index(), "[]");
    return null;
  },

  visitCastNode: function(node) {
    TypeChecker.super.prototype.visitCastNode.call(this, node);
    if (! node.expr().type().isCastableTo(node.type())) {
      this.invalidCastError(node, node.expr().type(), node.type());
    }
    return null;
  },

  //
  // Utilities
  //

  checkRHS: function(rhs) {
    // rhs: ExprNode
    if (this.isInvalidRHSType(rhs.type())) {
      this.error(rhs.location(), "invalid RHS expression type: " + rhs.type());
      return false;
    }
    return true;
  },

  // Processes forced-implicit-cast.
  // Applied To: return expr, assignment RHS, funcall argument
  implicitCast: function(targetType, expr) {
    // Type targetType, ExprNode expr
    if (expr.type().isSameType(targetType)) {
      return expr;
    } else if (expr.type().isCastableTo(targetType)) {
      if (! expr.type().isCompatible(targetType)
              && ! this.isSafeIntegerCast(expr, targetType)) {
        this.warn(expr.location(), "incompatible implicit cast from "
                        + expr.type() + " to " + targetType);
      }
      return new CastNode(targetType, expr);
    } else {
      this.invalidCastError(expr.location(), expr.type(), targetType);
      return expr;
    }
  },
  
  // Process integral promotion (integers only).
  integralPromotion: function(t) {
    // t: Type 
    if (!t.isInteger()) {
      throw new Error("integralPromotion for " + t);
    }
    var intType = this._typeTable.signedInt();
    if (t.size() < intType.size()) {
      return intType;
    } else {
      return t;
    }
  },
  // Usual arithmetic conversion for ILP32 platform (integers only).
  // Size of l, r >= sizeof(int).
  usualArithmeticConversion(l, r) {
    // l, r: Type
    var s_int = this._typeTable.signedInt();
    var u_int = this._typeTable.unsignedInt();
    var s_long = this._typeTable.signedLong();
    var u_long = this._typeTable.unsignedLong();
    if (    (l.isSameType(u_int) && r.isSameType(s_long))
         || (r.isSameType(u_int) && l.isSameType(s_long))) {
      return u_long;
    } else if (l.isSameType(u_long) || r.isSameType(u_long)) {
      return u_long;
    } else if (l.isSameType(s_long) || r.isSameType(s_long)) {
      return s_long;
    } else if (l.isSameType(u_int)  || r.isSameType(u_int)) {
      return u_int;
    } else {
      return s_int;
    }
  },

  isInvalidStatementType: function(t) {
    // Type t
    return t.isStruct() || t.isUnion();
  },

  isInvalidReturnType: function(t) {
    // Type t
    return t.isStruct() || t.isUnion() || t.isArray();
  },

  isInvalidParameterType: function(t) {
    // Type t
    return t.isStruct() || t.isUnion() || t.isVoid()
            || t.isIncompleteArray();
  },

  isInvalidVariableType: function(t) {
    // Type t
    return t.isVoid() || (t.isArray() && ! t.isAllocatedArray());
  },

  isInvalidLHSType: function(t) {
    // Type t
    // Array is OK if it is declared as a type of parameter.
    return t.isStruct() || t.isUnion() || t.isVoid() || t.isArray();
  },

  isInvalidRHSType: function(t) {
    // Type t
    return t.isStruct() || t.isUnion() || t.isVoid();
  },

  mustBeInteger: function(expr, op) {
    // ExprNode expr, String op
    if (! expr.type().isInteger()) {
      this.wrongTypeError(expr, op);
      return false;
    }
    return true;
  },

  mustBeScalar: function(expr, op) {
    // ExprNode expr, String op
    if (! expr.type().isScalar()) {
      this.wrongTypeError(expr, op);
      return false;
    }
    return true;
  },

  wrongTypeError: function(expr, op) {
    this.error(expr.location(), "wrong operand type for " + op + ": " + expr.type());
  },

  invalidCastError: function(location, l, r) {
    this.error(location, "invalid cast from " + l + " to " + r);
  },

  warn: function(location, msg) {
    // console.log(location + ' ' + msg);
  },

  error: function(location, msg) {
    this._errorHandler.collect('semantic error',
                       location.fileName(),
                       location.line(),
                       location.col(),
                       msg);
  }
});

