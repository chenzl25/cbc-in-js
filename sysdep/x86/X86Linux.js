var $extend = require('../../util/extend');
var $import = require('../../util/import');
var Platform = require('.././Platform');
var TypeTable = require('../../type/TypeTable');
var GNUAssembler = require('./GNUAssembler');
var GNULinker = require('./GNULinker');
var Type = require('../../asm/Type');
var X86CodeGenerator = require('../../visitor/Generator/X86CodeGenerator');
module.exports = X86Linux;

$extend(X86Linux, Platform);
function X86Linux() {

};

$import(X86Linux.prototype, {
  typeTable: function() {
    return TypeTable.ilp32();
  },

  naturalType: function() {
    return Type.INT32;
  },

  codeGenerator: function() {
    return new X86CodeGenerator(this.naturalType());
  },

  assembler: function() {
    return new GNUAssembler();
  },

  linker: function() {
    return new GNULinker();
  }
});

