module.exports = Expr;

function Expr(type) {
  this._type = type;
};


Expr.prototype = {
  type: function() {
    return this._type;
  },

  isVar: function() {
    return false; 
  },

  isAddr: function() {
    return false; 
  },

  isConstant: function() {
    return false; 
  },
  
  /**
   * @return {Object} // ImmediateValue
   */
  asmValue: function() {
      throw new Error("Expr abstract method call: asmValue");
  },
  
  /**
   * @return {Object} // Operand
   */
  address: function() {
      throw new Error("Expr abstract method call: address");
  },

  /**
   * @return {Object} // MemoryReference
   */
  memref: function() {
      throw new Error("Expr abstract method call: memref");
  },

  /**
   * @return {Object} // Expr
   */
  addressNode(type) {
      throw new Error("unexpected node for LHS: " + this.constructor);
  },

  /**
   * @return {Object} // Entity
   */
  getEntityForce: function() {
      return null;
  }

};
