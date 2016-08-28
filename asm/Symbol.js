var $extend = require('../util/extend');
var $import = require('../util/import');
var Literal = require('./Literal');
module.exports = Symbol;

$extend(Symbol, Literal);
function Symbol() {

};

$import(Symbol.prototype, {
  name: function() {

  },

  toString: function() {

  }
});
