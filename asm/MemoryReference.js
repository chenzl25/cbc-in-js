var $extend = require('../util/extend');
var $import = require('../util/import');
var Operand = require('./Operand');
module.exports = MemoryReference;

$extend(MemoryReference, Operand)
function MemoryReference() {

};

$import(MemoryReference.prototype, {
  isMemoryReference: function() {
    return true;
  },

  fixOffset: function(diff) {

  }
})
