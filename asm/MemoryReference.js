module.exports = MemoryReference;

function MemoryReference() {

};

MemoryReference.prototype = {
  isMemoryReference: function() {
    return true;
  },

  fixOffset: function(diff) {

  }
}
