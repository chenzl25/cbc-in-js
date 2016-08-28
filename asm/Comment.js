var $extend = require('../util/extend');
var $import = require('../util/import');
var Assembly = require('./Assembly');
module.exports = Comment;

$extend(Comment, Assembly);
function Comment(string, indentLevel) {
    // String string, int indentLevel
    this._string = string;
    this._indentLevel = indentLevel || 0;
};

$import(Comment.prototype, {
  isComment: function() {
    return true;
  },

  toSource: function(table) {
    // SymbolTable table
    return '\t' + this.indent() + '# ' + this._string;
  },

  indent: function() {
    var buf = "";
    for (var i = 0; i < this._indentLevel; i++) {
      buf += "  ";
    }
    return buf;
  }
});
