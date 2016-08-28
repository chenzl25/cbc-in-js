var $extend = require('../util/extend');
var $import = require('../util/import');
var Symbol = require('./Symbol');
module.exports = BaseSymbol;

$extend(BaseSymbol, Symbol);
function BaseSymbol() {

};

$import(BaseSymbol.prototype, {
  isZero: function() {
    return false;
  },

  collectStatistics: function(stats) {
    // Statistics stats
    stats.symbolUsed(this);
  },

  plus: function(n) {
    throw new Error("must not happen: BaseSymbol.plus called");
  }
});

