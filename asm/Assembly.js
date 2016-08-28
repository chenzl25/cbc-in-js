module.exports = Assembly;

function Assembly() {

};

Assembly.prototype = {
  /**
   * @param  {Object} table // SymbolTable
   * @return {String}
   */
  
  toSource: function(table) {
    throw new Error('Assembly abstract method call: toSource');
  },

  isInstruction: function() {
    return false;
  },

  isLabel: function() {
    return false;
  },

  isDirective: function() {
    return false;
  },

  isComment: function() {
    return false;
  },

  collectStatistics: function(stats) {
    // Statistics stats
    // does nothing by default.
  }
};

