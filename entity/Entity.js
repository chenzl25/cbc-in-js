var MemoryReference = require('../asm/MemoryReference');
var ImmediateValue = require('../asm/ImmediateValue');
module.exports = Entity;

function Entity(priv, type, name) {
  this._isPrivate = priv; // Boolean
  this._typeNode = type;  // TypeNode
  this._name = name;      // String
  this._nRefered = 0;     // Number
  this._memref;           // MemoryReference 
  this._address;          // Operand 

};

Entity.prototype = {
  name: function() {
    return this._name;
  },

  symbolString: function() {
    return this._name;
  },

  isDefined: function() {
    throw new Error('Entity abstract method call: isDefined');
  },

  isInitialized: function() {
    throw new Error('Entity abstract method call: isInitialized');
  },
  
  isConstant: function() {
   return false; 
  },

  value: function() {
    throw new Error("Entity#value");
  },

  isParameter() {
    return false; 
  },

  isPrivate() {
    return this._isPrivate;
  },

  typeNode: function() {
    return this._typeNode;
  },

  type: function() {
    return this._typeNode.type();
  },

  allocSize: function() {
    return this.type().allocSize();
  },

  alignment: function() {
    return this.type().alignment();
  },

  refered: function() {
    this._nRefered++;
  },

  isRefered: function() {
    return this._nRefered > 0;
  },

  /**
   * @param {Object} mem // MemoryReference
   */

  setMemref: function(mem) {
    this._memref = mem;
  },

  memref: function() {
    this.checkAddress();
    return this._memref;
  },

  setAddress: function(mem_or_imm) {
    // mem_or_imm : MemoryReference or ImmediateValue
    if (mem_or_imm instanceof MemoryReference) {
      this._address = mem_or_imm
    } else if (mem_or_imm instanceof ImmediateValue) {
      this._address = mem_or_imm;
    } else {
      throw new Error('Entity method: setAddress parameter error');
    }
  },

  address: function() {
    this.checkAddress();
    return this._address;
  },

  checkAddress: function() {
    if (this._memref == null && this._address == null) {
      throw new Error("address did not resolved: " + this._name);
    }
  },

  location: function() {
    return this._typeNode.location();
  },
}
