var $extend = require('../../util/extend');
var $import = require('../../util/import');
var asm = require('../../asm/index');
var RegisterClass = require('./RegisterClass');
module.exports = Register;

$extend(Register, asm.Register);
function Register(_class, type) {
  if (type == undefined) throw new Error('!!')
  // RegisterClass _class, asm.Type type
  this._class = _class;
  this._type = type;
};

$import(Register.prototype, {
  forType(t) {
    // Type t
    return new Register(this._class, t);
  },

  isRegister: function() {
    return true;
  },

  equals: function(other) {
    return (other instanceof Register) && this._class === other._class;
  },

  registerClass: function() {
    return this._class;
  },

  type: function() {
    return this._type;
  },

  baseName: function() {
    return this._class.toString().toLowerCase();
  },

  toSource: function(table) {
    // SymbolTable table
    // GNU assembler dependent
    return "%" + this.typedName();
  },

  typedName: function() {
    switch (this._type) {
    case asm.Type.INT8: return this.lowerByteRegister();
    case asm.Type.INT16: return this.baseName();
    case asm.Type.INT32: return "e" + this.baseName();
    case asm.Type.INT64: return "r" + this.baseName();
    default:
      throw new Error("unknown register Type: " + this._type);
    }
  },

  lowerByteRegister: function() {
      switch (this._class) {
      case RegisterClass.AX:
      case RegisterClass.BX:
      case RegisterClass.CX:
      case RegisterClass.DX:
        return this.baseName().substr(0, 1) + "l";
      default:
        throw new Error("does not have lower-byte register: " + this._class);
      }
  }
  
});
