var lex = require('../lexer/Lexer');
var tokenStream = require('../lexer/TokenStream');
var ErrorHandler = require('../util/ErrorHandler');

module.exports = parse;
module.exports.Parser = Parser;




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

  this.ts = new tokenStream(lex(str, options), options); // tokenStream
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

  compilationUnit: function(lookahead) {
    var impdecls, decls;

    impdecls = this.importStmts();
    decls = this.topDefs();
    this.EOF();

    if (lookahead) return;
    // TODO

  },

  EOF: function() {
    this.ts.accept("EOF", "EOF");
  },

  importStmts: function() {
    var libid, impdecls;

    while(this.ts.lookahead().value === 'import') {
      libid = this.importStmt();
      //TODO
    }
    return impdecls;
  },

  importStmt: function() {
    var str;

    this.acceptKeyWord("import");
    str = this.name();
    while(this.ts.lookahead().value === '.') {
      this.ts.acceptSymbol('.');
      str += '.';
      str += this.name();
      // TODO;
    }
    this.ts.acceptSymbol(';');
  },

  topDefs: function() {
    var decls;
    // TODO
    
    
  },

  name: function() {
    return this.acceptIdentifier().value;
  },


  acceptKeyWord: function(value) {
    this.ts.accept('keyWord', value);
  },

  acceptSymbol: function(value) {
    this.ts.accept('symbol', value);
  },

  acceptIdentifier: function() {
    this.ts.accept('identifier');
  },

  acceptNumber: function() {
    this.ts.accept('number');
  }
}

