var $extend = require('../../util/extend');
var $import = require('../../util/import');
var IRVisitor = require('../AbstractVisitor/IRVisitor');
var Int = require('../../ir/Int');
var Bin = require('../../ir/Bin');
var Op = require('../../ir/Op');
module.exports = ConstantFolder;

$extend(ConstantFolder, IRVisitor);
function ConstantFolder() {

};

$import(ConstantFolder.prototype, {
  optimize: function(ir) {
    // do not fold the ir.definedVariables(), 
    // because it can be detected by semantic check
    this.foldDefinedFunctions(ir.definedFunctions());
  },

  foldDefinedFunctions: function(funs) {
    for (var f of funs) {
      this.visitStmts(f.ir());
    }
  },

  visitExprStmt: function(node) {
    // no way to fold
  },

  visitAssign: function(node) {
    var fold = this.visit(node.rhs());
    if (fold) {
      node._rhs = fold;
    }
  },

  visitCJump: function(node) {
    var fold = this.visit(node.cond());
    if (fold) node._cond = fold;
  },

  visitSwitch: function(node) {
    var fold = this.visit(node.cond());
    if (fold) node._cond = fold;
  },

  visitReturn: function(node) {
    if (!node.expr()) return;
    var fold = this.visit(node.expr());
    if (fold) node._expr = fold;
  },

  //
  // Expr
  //
  
  visitUni: function(node) {
    var fold = this.visit(node.expr());
    if (fold) node._expr = fold;
  },

  visitBin: function(node) {
    var foldL = this.visit(node.left());
    var foldR = this.visit(node.right());
    if (foldL) node._left = foldL;
    if (foldR) node._right = foldR;
    if (node.left() instanceof Int &&
        node.right() instanceof Int) {
      var type = node.left().type();
      var lv = node.left().value();
      var rv = node.right().value();
      switch (node.op()) {
        case Op.ADD: return new Int(type, lv + rv);
        case Op.SUB: return new Int(type, lv - rv);
        case Op.MUL: return new Int(type, lv * rv);
        case Op.S_DIV: return new Int(type, lv / rv);
        case Op.U_DIV: return new Int(type, lv / rv);
        case Op.S_MOD: return new Int(type, lv % rv);
        case Op.U_MOD: return new Int(type, lv % rv);
        case Op.BIT_AND: return new Int(type, lv & rv);
        case Op.BIT_OR: return new Int(type, lv | rv);
        case Op.BIT_XOR: return new Int(type, lv ^ rv);
        case Op.BIT_LSHIFT: return new Int(type, lv << rv);
        case Op.BIT_RSHIFT: return new Int(type, lv >> rv);
        case Op.ARITH_RSHIFT: return new Int(type, lv >> rv);
        case Op.EQ: return new Int(type, (lv === rv)? 1 : 0);
        case Op.NEQ: return new Int(type, (lv !== rv)? 1 : 0);
        case Op.S_GT: return new Int(type, (lv > rv)? 1 : 0);
        case Op.S_GTEQ: return new Int(type, (lv >= rv)? 1 : 0);
        case Op.S_LT: return new Int(type, (lv < rv)? 1 : 0);
        case Op.S_LTEQ: return new Int(type, (lv <= rv)? 1 : 0);
        case Op.U_GT: return new Int(type, (lv > rv)? 1 : 0);
        case Op.U_GTEQ: return new Int(type, (lv >= rv)? 1 : 0);
        case Op.U_LT: return new Int(type, (lv < rv)? 1 : 0);
        case Op.U_LTEQ: return new Int(type, (lv <= rv)? 1 : 0);
        default: throw new Error('impossible reach here');
      }
    }

    var fold = this.algebraExchange(node);
    return fold == null? null : fold; 
  }, // end of visitBin

  /**
   * @param {Object} node // Bin
   * @return {Object}     // old or new Bin
   */

  algebraExchange: function(node) {
    var fold;

    if (node.left() instanceof Bin &&
        node.right() instanceof Int &&
        node.op() === node.left().op()) {
      fold = this._algebraExchangeLeft(node);
      if (fold) return fold;
    }

    if (node.left() instanceof Int &&
        node.right() instanceof Bin &&
        node.op() === node.left().op()) {
      var tem = node.right();
      node._right = node.left();
      node._left = tem;
      fold = this._algebraExchangeLeft(node);
      if (fold) return fold;
    }

    return null;
  },

  /**
   *         +            +
   *        / \          / \
   *       +   2   =>   +   a 
   *      / \          / \
   *     1   a        1   2
   */

  _algebraExchangeLeft: function(node) {
    if (node.left().left() instanceof Int) {
      var tem = node.right();
      node._right = node.left().right();
      node._left._right = tem;
      var fold = this.visit(node.left()); // 100% can fold
      node._left = fold; 
      return node;
    }
    if (node.left().right() instanceof Int) {
      var tem = node.right();
      node._right = node.left().left();
      node._left._left = tem;
      var fold = this.visit(node.left()); // 100% can fold
      node._left = fold; 
      return node;
    }
    // impossible reach
  },

  visitCall: function(node) {
    var args = node.args();
    var fold = null;
    for (var i = 0; i < args.length; i++) {
      fold = this.visit(args[i]);
      if (fold) args[i] = fold;
      fold = null;
    }
  },

  visitAddr: function(node) {
    // no way to fold
  },

  visitMem: function(node) {
    var fold = this.visit(node.expr());
    if (fold) this._expr = fold;
  },

  visitVar: function(node) {
    // no way to fold
  },

  visitCase: function(node) {
    // no way to fold
  },

  visitInt: function(node) {
    // no way to fold
  },

  visitStr: function(node) {
    // no way to fold
  },
});
