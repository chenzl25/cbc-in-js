var Token = require('./Token');
var ErrorHandler = require('../util/ErrorHandler');

module.exports = lex;
module.exports.Lexer = Lexer;


function lex(str, options) {
  var lexer = new Lexer(str, options);
  return lexer.getTokens();
}

function Lexer(str, options) {
  options = options || {};
  if (typeof str !== 'string') {
    throw new Error('Expected source code to be a string but got "' + (typeof str) + '"')
  }
  if (typeof options !== 'object') {
    throw new Error('Expected "options" to be an object but got "' + (typeof options) + '"');
  }

  this.input = str.replace(/\r\n|\r/g, '\n') + '\n';
  this.options = options;
  this.lineno = 1;
  this.colno = 1;
  this.cursor = 0;
  this.patterns = [];
  this.tokens = [];
  this.config();
};

Lexer.prototype = {

  constructor: Lexer,

  /**
   * Tokens
   * @return [Token]
   */

  getTokens: function() {
    var result = [];
    var token;

    token = this.getToken()
    while (token.type !== 'EOF') {
      if (token.type !== 'lineComment' && token.type !== 'blockComment')
        result.push(token);
      token = this.getToken();
    }
    result.push(token); // EOF
    return result;
  },

  /**
   * Token
   * @return {type:String, value:String, lineno:number, colno:number}
   */
  
  getToken: function() {
    var token;

    if (this.checkEOF()) return new Token("EOF", "EOF", this.lineno, this.colno);
    this.removeSpace();
    if (this.checkEOF()) return new Token("EOF", "EOF", this.lineno, this.colno);
    
    if (token = this.blockComment()) return token;
    if (token = this.blockString() ) return token;

    var longest = 0;
    var mm;
    for (var i = 0; i < this.patterns.length; i++) {
      var tokenName = this.patterns[i].tokenName;
      var pattern = this.patterns[i].pattern;
      var m = this.input.slice(this.cursor).match(pattern);
      if (m && m.index == 0 && m[1].length > longest) {
        mm = m;
        token = new Token(tokenName, m[1], this.lineno, this.colno);
        longest = token.value.length;
      }
    }

    if (longest > 0) {
      this.incCursor(mm[0].length)
      if (token.type === "lineComment") this.incLineNo();
      else this.incColNo(mm[0].length);
      return token;
    } else {
      ErrorHandler.error("token error",
                         this.options.fileName,
                         this.lineno,
                         this.colno,
                         this.input.slice(this.cursor, this.cursor+10) + 
                         "..." + '\n'+ "^^^^^^^^^^" + '\n');
    }
  },

  checkEOF: function() {
    if (this.cursor >= this.input.length) {
      return true;
    } else {
      return false;
    }
  }, 

  removeSpace: function() {
    var hasSpace = true;
    while (hasSpace) {
      hasSpace = false
      while (this.input[this.cursor] === '\t' ||
             this.input[this.cursor] === '\b' ||
             this.input[this.cursor] === ' ') {
        this.incCursor(1);
        this.incColNo(1);
        hasSpace = true;
      }
      while (this.input[this.cursor] === '\n') {
        this.incCursor(1);
        this.incLineNo();
        hasSpace = true;
      }
    }
  },

  config: function() {
      var self = this;

      var keyWords =  ["void", "char", "short", "int", "long", "struct", 
                       "union", "enum", "static", "extern", "const", "signed",
                       "unsigned", "if", "else", "switch", "case", "default", 
                       "while", "do", "for", "return", "break", "continue", 
                       "goto", "typedef", "import", "sizeof"];
      keyWords.forEach(function(ele) {
        self.patternMatch("keyWord", new RegExp("("+ele+")"));
      });


      var symbols = ["<<=", ">>=", "+=", "-=", "*=", "/=", "%=", ">=", "<=", "==",
                     "!=", "->", "<<", ">>", "&&", "||", "&", "|", "++", "--",
                     "+", "-", "*", "/", "%", ">", "<", ",", ".", "?", ":", ";",
                     "(", ")", "{", "}", "[", "]", "!", "=", "~", "^" ];
      symbols.forEach(function(ele) {
        ele = self.escape(ele);
        self.patternMatch("symbol", new RegExp("("+ele+")"));
      });


      self.patternMatch("identifier", /([a-zA-Z_][a-zA-Z0-9_]*)/);
      self.patternMatch("char", /(\'[\w\s]\')/);
      self.patternMatch("number", /([0-9]+)/); //only interger
      self.patternMatch("lineComment", /(\/\/.*)\n/);

  },
  
  patternMatch: function (tokenName, pattern) {
    this.patterns.push({tokenName : tokenName,
                        pattern   : pattern});
  },

  /**
   *
   * @param  {String} ele
   * @return {String}
   */
  
  escape: function(ele) {
    var result = "";
    for (var i = 0; i < ele.length; i++) {
      switch (ele[i]) {
        case '+': 
        case '*':
        case '/':
        case '?':
        case '|':
        case '(':
        case ')':
        case '{':
        case '}':
        case '[':
        case ']':
        case '.':
        case '^':
          result += '\\' + ele[i];
          break;
        default:
          result += ele[i];
      }
    }
    return result;
  },

  incLineNo: function () {
    this.lineno++;
    this.colno = 1;
  },

  incColNo: function(increment) {
    this.colno += increment;
  },

  incCursor: function(increment) {
    this.cursor += increment;
  },

  /**
   * Token
   * @return {type:String, value:String, lineno:number, colno:number}
   */

  blockString: function() {
    if (this.input[this.cursor] !== '\"') return null;            
    // cursor colno in "xxx"
    //                 ^
    var str;
    var token = null;
    for (var i = this.cursor + 1; i < this.input.length; i++) {
      if (this.input[i] == '\"' && this.input[i-1] != '\\') {
        str = '\"' + this.input.slice(this.cursor+1, i) + '\"';
        this.incCursor(str.length);  
        break;                
      }
    }
    if (str) {
      token = new Token("string", str, this.lineno, this.colno);
      this.incColNo(str.length);
      // cursor colno in "xxx"
      //                      ^
    }
    return token;
  },

  /**
   * Token
   * @return {type:String, value:String, lineno:number, colno:number}
   */

  blockComment: function() {
    if (this.input[this.cursor] !== '/' ||
        this.input[this.cursor+1] !== '*') return null;
    // cursor col in /*xxx*/
    //               ^
    var comment;
    var token = null;
    var before_colno = this.colno;
    var lastLineBegin = -1;
    for (var i = this.cursor + 2; i < this.input.length; i++) {
      if (this.input[i] === '*' && this.input[i+1] === '/') {
        comment = '/*' + this.input.slice(this.cursor+2, i) + '*/';
        this.incCursor(comment.length);
        break;
      } else if (this.input[i] === '\n') {
        this.incLineNo();
        lastLineBegin = i+1;
      }
    }
    if (comment) {
      token = new Token("blockComment", comment, this.lineno, before_colno);
      if (lastLineBegin == -1) {
        this.incColNo(comment.length);
      } else {
        this.incColNo(this.cursor - lastLineBegin);
      }
    }
    // cursor col in /*xxx*/
    //                      ^
    return token;
  }
} // end of prototype