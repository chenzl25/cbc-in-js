var $extend = require('../util/extend');
var $import = require('../util/import');
var Assembly = require('./Assembly');
module.exports = Directive;

$extend(Directive, Assembly);
function Directive(content) {
  // String content
  this._content = content;
};

$import(Directive.prototype, {
  isDirective: function() {
    return true;
  },

  toSource: function(table) {
    // SymbolTable table
    return this._content;
  }
});

