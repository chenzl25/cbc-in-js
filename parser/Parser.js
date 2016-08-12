module.exports = parse;
module.exports.Parser = Parser;

var lex = require('../lexer/Lexer');
var tokenStream = require('../lexer/TokenStream');

function parse(str, options) {
  var parser = new Parser(str, options);
  var ast = parser.parse();
  return ast
}

function Parser(str, options) {
  options = options || {};
  if (typeof str !== 'string') {
    throw new Error('Expected source code to be a string but got "' + (typeof str) + '"')
  }
  if (typeof options !== 'object') {
    throw new Error('Expected "options" to be an object but got "' + (typeof options) + '"');
  }

  this.ts = new tokenStream(lex(str, options)); // tokenStream
  this.options = options;
  this.ast = null;
};

Parser.prototype = {

  constructor: Parser,

  /**
   * @return AST
   */

  parse: function() {
    return this.compilationUnit();
  },

  compilationUnit: function() {

  }

}

