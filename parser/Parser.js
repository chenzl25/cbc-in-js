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
  this.knownTypedefs = new Set();
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

    while(this.peek().value === 'import') {
      libid = this.importStmt();
      //TODO
    }
    return impdecls;
  },

  importStmt: function() {
    var str;

    this.acceptKeyWord("import");
    str = this.name();
    while(this.peek().value === '.') {
      this.acceptSymbol('.');
      str += '.';
      str += this.name();
      // TODO maybe;
    }
    this.acceptSymbol(';');
    // TODO
  },

  topDefs: function() {
    var decls, defun, defvars, defconst,
        defstruct, defunion, typedef;
    var handle;
    // lookahead
    while(this.peek().type != 'EOF') {
      handle = this.getHandle();
      if (this.storageLookahead() &&
          this.typerefLookahead() &&
          this.peek().type === 'identifier'
          ) {
        if (this.peek(1).value === '(') {
          this.restore(handle);
          defun = this.defun();
          //TODO
        } else {
          this.restore(handle);
          defvars = this.defvars();
          //TODO
        }
      } else {
        this.restore(handle);
        switch(this.peek().value) {
          case 'const':
            defconst = this.defconst();
            break;
          case 'struct':
            defstruct =  this.defstruct();
            break;
          case 'union':
            defunion = this.defunion();
            break;
          case 'typedef':
            typedef = this.typedef();
            break;
          default:
            this.error('fail to parse topDefs');
        }
      }
    }
    // TODO
  }, // end of topDefs



  defun: function() {
    var priv, ret, n, ps, body;
    priv=this.storage();
    this.ret=this.typeref();
    n=this.name();
    this.acceptSymbol('(');
    ps=this.params();
    this.acceptSymbol(')');
    body=this.block();
    // TODO
  },
  
  params: function() {
    var t, params;
    if (this.peek().value === 'void' && this.peek(1).value === ')') {
      t = this.acceptKeyWord('void');
      // TODO
    } else {
      params = this.fixedparams();
      if (this.peek().value === ',' && this.peek(1).value === '...') {
        //TODO
      }
    }
    //TODO
  },

  fixedparams: function() {
    var param1, param, params;

    param1 = this.param();
    while (this.peek().value === ',' && this.peek(1).value !== '...') {
      this.acceptSymbol(',');
      param = this.param();
      // TODO
    } 
    // TODO
  },

  param: function() {
    var type, n;
    type = this.type();
    n = this.name();
    // TODO
  },

  block: function() {
    var t, vars, stams;
    t = this.acceptSymbol('{');
    vars = this.defvarList();
    stmts = this.stmts(); 
    this.acceptSymbol('}');

    //TODO
    return "dummy";
  },

  stmts: function() {
    var ss, s;

    while(s = this.stmt()) {
      // TODO;
    }
    return ss;
  },

  stmt: function() {
    var s = 'dummy', e;
    var handle;
    handle = this.getHandle();

    if (this.peek().type === 'identifier' && this.peek(1).value === ':') {
        s = this.labeled_stmt();
        // TODO
        return s;
    }
    
    this.restore(handle);
    if (this.exprLookahead()) {
      this.restore(handle);  
      e = this.expr();
      this.acceptSymbol(';');
      // TODO
      return s;
    }

    this.restore(handle);
    switch(this.peek().value) {
      case ';':
        break;
      case '{':
        s = this.block();
        break;
      case 'if':
        s = this.ifStmt();
        break;
      case 'while':
        s = this.WhileStmt();
        break;
      case 'do':
        s = this.doWhileStmt();
        break;
      case 'for':
        s = this.forStmt();
        break;
      case 'switch':
        s = this.switchStmt();
        break;
      case 'break':
        s = this.breakStmt();
        break;
      case 'continue':
        s = this.continueStmt();
        break;
      case 'goto':
        s = this.gotoStmt();
        break;
      case 'return':
        s = this.returnStmt();
        break;
      default:
        return null;
    }
    return s;
  }, // end of stmt

  ifStmt: function() {
    var t, cond, thenBody, elseBody;

    t = this.acceptKeyWord('if');
    this.acceptSymbol('(');
    cond = this.expr();
    this.acceptSymbol(')');
    thenBody = this.stmt();
    if (this.tryKeyWord('else')) {
      elseBody = this.stmt();
    }
    // TODO
    return "dummy";
  },

  WhileStmt: function() {
    var t, cond, body;

    t = this.acceptKeyWord('while');
    this.acceptSymbol('(');
    cond = this.expr();
    this.acceptSymbol(')');
    body = this.stmt();
    // TODO
    return "dummy";
  },

  doWhileStmt: function() {
    var t, body, cond;

    t = this.acceptKeyWord('do');
    body = this.stmt();
    this.acceptKeyWord('while');
    this.acceptSymbol('(');
    cond = this.expr();
    this.acceptSymbol(')');
    this.acceptSymbol(';');
    // TODO
    return "dummy";
  },

  forStmt: function() {
    var t, init, cond, incr, body;

    this.acceptKeyWord('for');
    this.acceptSymbol('(');
    if (this.peek().value !== ';') {
      this.expr();
    }
    this.acceptSymbol(';');
    if (this.peek().value !== ';') {
      this.expr();
    }
    this.acceptSymbol(';');
    if (this.peek().value !== ')') {
      this.expr();
    }
    this.acceptSymbol(')');
    //TODO
    return "dummy";
  },

  switchStmt: function() {

    return "dummy";
  },

  breakStmt: function() {
    this.acceptKeyWord('break');
    this.acceptSymbol(';');
    return "dummy";
  },

  continueStmt: function() {
    this.acceptKeyWord('continue');
    this.acceptSymbol(';');
    return "dummy";
  },

  gotoStmt: function() {
    var t, name;

    t = this.acceptKeyWord('goto');
    name = this.acceptIdentifier();
    // TODO
    return "dummy";
  },

  returnStmt: function() {
    var t, expr;
    this.acceptKeyWord('return');
    if (this.peek().value !== ';') {
      expr = this.expr();
    }
    this.acceptSymbol(';');
    // TODO
    return "dummy";
  },

  defvarList: function() {
    var result, vars;
    var handle;
    
    while (true) {
      handle = this.getHandle();
      if (this.storageLookahead() && this.typeLookahead()) {
        this.restore(handle);
        vars = this.defvars();
        // TODO
      } else {
        this.restore(handle);
        break;
      }
    }
    //TODO
  },

  defvars: function() {
    var defs ,priv, type, name, init = null;

    priv = this.storage();
    type = this.type();
    name = this.name();
    if (this.peek().value === '=') {
      this.acceptSymbol('=');
      init = this.expr();
      // TODO
      init = null;
    }
    while (this.peek().value === ',') {
      this.acceptSymbol(',');
      name = this.name();
      if (this.peek().value === '=') {
        this.acceptSymbol('=');
        init = this.expr();
      }
      // TODO
      init = null;
    }
    this.acceptSymbol(';');
    // TODO
  },

  
  defconst: function() {
    var type, name, value;
    this.acceptKeyWord('const');
    type = this.type();
    name = this.name();
    this.acceptSymbol('=');
    value = this.expr();
    this.acceptSymbol(';');
    // TODO
  },

  
  defstruct: function() {
    var t, n, membs;

    t = this.acceptKeyWord('struct');
    n = this.name();
    membs = this.memberList();
    this.acceptSymbol(';');
    // TODO
  },

  
  defunion: function() {
    var t, n, membs;

    t = this.acceptKeyWord('union');
    n = this.name();
    membs = this.memberList();
    this.acceptSymbol(';');
    // TODO
  },

  memberList: function() {
    var s, membs;
    var handle;
    this.acceptSymbol("{");
    handle = this.getHandle();
    while(this.typeLookahead()) {
      this.restore(handle);
      s = this.slot();
      // TODO
      this.acceptSymbol(';');
      handle = this.getHandle();
    }
    this.acceptSymbol('}');
    // TODO
  },

  slot: function() {
    var t, n;
    t = this.type();
    n = this.name();
    //TODO;
  },

  storage: function() {
    if (this.peek().value === 'static') {
      this.acceptKeyWord('static');
      return true;
    } else {
      return false;
    }
  },

  storageLookahead: function() {
    if (this.peek().value === 'static') {
      this.acceptKeyWord('static');
    }
    return true;
  },
  
  type: function() {
    var typeref = this.typeref();
    // TODO
  },

  typeLookahead: function()  {
    return this.typerefLookahead();
  },

  typeref: function() {
    var ref;

    ref = this.typerefBase();
    out: while (true) {
      switch (this.peek().value) {
        case '[': {
          this.acceptSymbol('[');
          if (this.peek().type === 'number')
            var n = this.acceptNumber().value;
          this.acceptSymbol(']');
          //TODO 
          break;
        }
        case '*':
          this.acceptSymbol('*');
          // TODO
          break;
        case '(':
          this.acceptSymbol('(');
          var params = this.paramTyperefs();
          this.acceptSymbol(')');
          // TODO
          break;
        default:
          break out;
      }
    }
    // TODO
  },

  typerefLookahead: function() {
    if (!this.typerefBaseLookahead()) return false;
    out: while (true) {
      switch (this.peek().value) {
        case '[': {
          if (this.peek().value === '[' &&
              this.peek(1).type === 'number' &&
              this.peek(2).value === ']') {
            this.acceptSymbol('[');
            this.acceptNumber().value;
            this.acceptSymbol(']');
          } else {
            return false;
          }
          break;
        }
        case '*':
          this.acceptSymbol('*');
          break;
        case '(':
          this.acceptSymbol('(');
          if (!this.paramTyperefsLookahead()) return false;
          if (this.peek().value === ')') this.acceptSymbol(')');
          else return false;
          break;
        default:
          break out;
      }
    }
    return true;
  },

  typerefBase: function(lookahead) {
    if (this.peek().value === 'unsigned') {
      this.acceptKeyWord('unsigned');
      switch(this.peek().value) {
        case 'char':
          this.acceptKeyWord('char');
          // TODO
          break;
        case 'short':
          this.acceptKeyWord('short');
          // TODO
          break;
        case 'int':
          this.acceptKeyWord('int');
          // TODO
          break;
        case 'long':
          this.acceptKeyWord('long');
          // TODO
          break;
        default:
          if (lookahead) return false;
          else this.error('fail to parse typerefBase1');
      }
    } else if (this.peek().type === 'identifier') {
      if (this.isType(this.peek().value)) {
        var t = this.acceptIdentifier();
        // TODO
      } else {
        if (lookahead) return false;
        else this.error('fail to parse typerefBase2');
      }
    } else {
      switch(this.peek().value) {
        case 'void':
          this.acceptKeyWord('void');
          // TODO
          break;
        case 'char':
          this.acceptKeyWord('char');
          // TODO
          break;
        case 'short':
          this.acceptKeyWord('short');
          // TODO
          break;
        case 'int':
          this.acceptKeyWord('int');
          // TODO
          break;
        case 'long':
          this.acceptKeyWord('long');
          // TODO
          break;
        case 'struct':
          this.acceptKeyWord('struct');
          var t = this.acceptIdentifier();
          // TODO
          break;
        case 'union':
          this.acceptKeyWord('union');
          var t = this.acceptIdentifier();
          // TODO
          break;
        default:
          if (lookahead) return false;
          else this.error('fail to parse typerefBase3');
      }
    }

    if (lookahead) return true;
    else ;// TODO
  }, // end of typerefBase
  
  typerefBaseLookahead: function() {
    return this.typerefBase(true);
  },

  typedef: function() {
    var t = this.acceptKeyWord('typedef');
    var ref = this.typeref();
    var name = this.acceptIdentifier().value;
    this.acceptSymbol(';');
    
    this.addType(name);
    // TODO
  },

  paramTyperefs: function() {
    var t, params;
    if (this.peek().value === 'void' && this.peek(1).value === ')') {
      t = this.acceptKeyWord('void');
      // TODO
    } else {
      params = this.fixedparamTyperefs();
      if (this.peek().value === ',' && this.peek(1).value === '...') {
        //TODO
      }
    }
    //TODO
  },

  paramTyperefsLookahead: function() {
    if (this.peek().value === 'void' && this.peek(1).value === ')') {
      this.acceptKeyWord('void');
      return true;
    } else {
      if (!this.fixedparamTyperefsLookahead()) return false;
      if (this.peek().value === ',' && this.peek(1).value === '...') {
        this.acceptSymbol(',');
        this.acceptSymbol('...');
      }
    }
    return true;
  },

  fixedparamTyperefs: function() {
    var ref, refs;

    ref = this.typeref();
    while (this.peek().value === ',' && this.peek(1).value !== '...') {
      ref = this.typeref();
      // TODO
    } 
    // TODO
  },

  fixedparamTyperefsLookahead: function() {
    if (!this.typerefLookahead()) return false;
    while (this.peek().value === ',' && this.peek(1).value !== '...') {
      if(!this.typerefLookahead()) return false;
    } 
    return true;
  },

  name: function() {
    return this.acceptIdentifier().value;
  },

  nameLookahed: function() {
    return this.tryIdentifier();
  },

  expr: function() {
    var lhs, rhs, expr, op;
    var handle = this.getHandle();

    if (this.termLookahead() && this.trySymbol('=')) {
      this.restore(handle);
      lhs = this.term();
      this.acceptSymbol('=');
      rhs = this.expr();
      // TODO 
      return;
    } 

    this.restore(handle);
    if (this.termLookahead() && this.opassignOpLookahead()) {
      this.restore(handle);
      lhs = this.term();
      op = this.opassignOp();
      rhs = this.expr();
      // TODO
      return;
    } 

    this.restore(handle);
    return this.expr10();
  },

  exprLookahead: function() {

    var handle = this.getHandle();
    if (this.termLookahead() && this.trySymbol('=') && this.exprLookahead()) {
        return true;
    }

    this.restore(handle);
    if (this.termLookahead() && this.opassignOpLookahead() && this.exprLookahead()) {
      return true;
    }

    this.restore(handle);
    return this.expr10Lookahead();
  },

  opassignOp: function() {
    switch(this.peek().value) {
      case "+=":
        this.acceptSymbol('+=');
        return "+";
        break;
      case "-=":
        this.acceptSymbol('-=');
        return "-";
        break;
      case "*=":
        this.acceptSymbol('*=');
        return "*";
        break;
      case "/=":
        this.acceptSymbol('/=');
        return "/";
        break;
      case "%=":
        this.acceptSymbol('%=');
        return "%";
        break;
      case "&=":
        this.acceptSymbol('&=');
        return "&";
        break;
      case "|=":
        this.acceptSymbol('|=');
        return "|";
        break;
      case "^=":
        this.acceptSymbol('^=');
        return "^";
        break;
      case "<<=":
        this.acceptSymbol('<<=');
        return "<<";
        break;
      case ">>=":
        this.acceptSymbol('>>=');
        return ">>";
        break;
      default:
        this.error("fail to parse opassignOp");
    }
  },

  opassignOpLookahead: function() {
    return (this.trySymbol("+=") ||
            this.trySymbol("-=") ||
            this.trySymbol("*=") ||
            this.trySymbol("/=") ||
            this.trySymbol("%=") ||
            this.trySymbol("&=") ||
            this.trySymbol("|=") ||
            this.trySymbol("^=") ||
            this.trySymbol("<<=")||
            this.trySymbol(">>="));
  },

  expr10: function() {
    var c, t, e;
    c = this.expr9();
    if (this.peek().value === '?') {
      this.acceptSymbol('?');
      t = this.expr();
      this.acceptSymbol(':');
      e = this.expr10();
      // TODO
    }
    return c;
  },
  
  expr10Lookahead: function() {
    if (!this.expr9Lookahead()) return false;
    if (this.peek().value === '?') {
      this.acceptSymbol('?');
      if (!this.exprLookahead()) return false;
      if (this.peek().value === ':') this.acceptSymbol(':');
      else return false;
      if (!this.expr10Lookahead()) return false
    }
    return true
  },

  expr9: function() {
    var l, r;
    l = this.expr8();
    while (this.peek().value === '||') {
      this.acceptSymbol('||');
      r = this.expr8();
      // TODO
    }
    return l;
  },

  expr9Lookahead: function() {
    if (!this.expr8Lookahead()) return false;
    while (this.peek().value === '||') {
      this.acceptSymbol('||');
      if (!this.expr8Lookahead()) return false;
    }
    return true;
  },

  expr8: function() {
    var l, r;
    l = this.expr7();
    while (this.peek().value === '&&') {
      this.acceptSymbol('&&');
      r = this.expr7();
      // TODO
    }
    return l;
  },

  expr8Lookahead: function() {
    if (!this.expr7Lookahead()) return false;
    while (this.peek().value === '&&') {
      this.acceptSymbol('&&');
      if (!this.expr7Lookahead()) return false;
    }
    return true;
  },

  expr7: function() {
    var l, r;
    l = this.expr6();
    out: while(true) {
      var op = this.peek().value;
      switch(op) {
        case '>':
          this.acceptSymbol('>');
          break;
        case '<':
          this.acceptSymbol('<');
          break;
        case '>=':
          this.acceptSymbol('>=');
          break;
        case '<=':
          this.acceptSymbol('<=');
          break;
        case '==':
          this.acceptSymbol('==');
          break;
        case '!=':
          this.acceptSymbol('!=');
          break;
        default:
          break out;
      }
      r = this.expr6();
      // TODO
    }
    return l;
  },

  expr7Lookahead: function() {
    if (!this.expr6Lookahead()) return false;
    out: while(true) {
      var op = this.peek().value;
      switch(op) {
        case '>':
          this.acceptSymbol('>');
          break;
        case '<':
          this.acceptSymbol('<');
          break;
        case '>=':
          this.acceptSymbol('>=');
          break;
        case '<=':
          this.acceptSymbol('<=');
          break;
        case '==':
          this.acceptSymbol('==');
          break;
        case '!=':
          this.acceptSymbol('!=');
          break;
        default:
          break out;
      }
      if (!this.expr6Lookahead()) return false;
    }
    return true;
  },

  expr6: function() {
    var l, r;
    l = this.expr5();
    while (this.peek().value === '|') {
      this.acceptSymbol('|');
      r = this.expr5();
      // TODO
    }
    return l;
  },

  expr6Lookahead: function() {
    if (!this.expr5Lookahead()) return false;
    while (this.peek().value === '|') {
      this.acceptSymbol('|');
      if (!this.expr5Lookahead()) return false;
    }
    return true;
  },

  expr5: function() {
    var l, r;
    l = this.expr4();
    while (this.peek().value === '^') {
      this.acceptSymbol('^');
      r = this.expr4();
      // TODO
    }
    return l;
  },

  expr5Lookahead: function() {
    if (!this.expr4Lookahead()) return false;
    while (this.peek().value === '^') {
      this.acceptSymbol('^');
      if (!this.expr4Lookahead()) return false;
    }
    return true;
  },

  expr4: function() {
    var l, r;
    l = this.expr3();
    while (this.peek().value === '&') {
      this.acceptSymbol('&');
      r = this.expr3();
      // TODO
    }
    return l;
  },

  expr4Lookahead: function() {
    if (!this.expr3Lookahead()) return false;
    while (this.peek().value === '&') {
      this.acceptSymbol('&');
      if (!this.expr3Lookahead()) return false;
    }
    return true;
  },

  expr3: function() {
    var l, r;
    l = this.expr2();
    out: while(true) {
      var op = this.peek().value;
      switch(op) {
        case '>>':
          this.acceptSymbol('>>');
          break;
        case '<<':
          this.acceptSymbol('<<');
          break;
        default:
          break out;
      }
      r = this.expr2();
      // TODO
    }
    return l;
  },

  expr3Lookahead: function() {
    if (!this.expr2Lookahead()) return false;
    out: while(true) {
      var op = this.peek().value;
      switch(op) {
        case '>>':
          this.acceptSymbol('>>');
          break;
        case '<<':
          this.acceptSymbol('<<');
          break;
        default:
          break out;
      }
      if (!this.expr2Lookahead()) return false;
    }
    return true;
  },

  expr2: function() {
    var l, r;
    l = this.expr1();
    out: while(true) {
      var op = this.peek().value;
      switch(op) {
        case '+':
          this.acceptSymbol('+');
          break;
        case '-':
          this.acceptSymbol('-');
          break;
        default:
          break out;
      }
      r = this.expr1();
      // TODO
    }
    return l;
  },

  expr2Lookahead: function() {
    if (!this.expr1Lookahead()) return false;
    out: while(true) {
      var op = this.peek().value;
      switch(op) {
        case '+':
          this.acceptSymbol('+');
          break;
        case '-':
          this.acceptSymbol('-');
          break;
        default:
          break out;
      }
      if (!this.expr1Lookahead()) return false;
    }
    return true;
  },

  expr1: function() {
    var l, r;
    l = this.term();
    out: while(true) {
      var op = this.peek().value;
      switch(op) {
        case '*':
          this.acceptSymbol('*');
          break;
        case '/':
          this.acceptSymbol('/');
          break;
        case '%':
          this.acceptSymbol('%');
          break;
        default:
          break out;
      }
      r = this.term();
      // TODO
    }
    return l;
  },

  expr1Lookahead: function() {
    if (!this.termLookahead()) return false;
    out: while(true) {
      var op = this.peek().value;
      switch(op) {
        case '*':
          this.acceptSymbol('*');
          break;
        case '/':
          this.acceptSymbol('/');
          break;
        case '%':
          this.acceptSymbol('%');
          break;
        default:
          break out;
      }
      if (!this.termLookahead()) return false;
    }
    return true;
  },

  term: function() {
    var type, e;
    var handle = this.getHandle();

    if (this.trySymbol('(') && this.typeLookahead()){
      this.restore(handle);
      this.acceptSymbol('(');
      type = this.type();
      this.acceptSymbol(')');
      e = this.term();
      // TODO
    } else {
      this.restore(handle);
      e = this.unary();
      // TODO
    }
  },

  termLookahead: function() {
    var handle = this.getHandle();
    if (this.trySymbol('(') && this.typeLookahead() && 
        this.trySymbol(')') && this.termLookahead()) {
      return true;
    } 
    this.restore(handle);
    return this.unaryLookahead();
  }, 

  unary: function() {
    var type, e;
    var handle;
    handle = this.getHandle();

    if (this.tryKeyWord('sizeof') && this.trySymbol('(') && this.typeLookahead()) {
      this.restore(handle);
      this.acceptKeyWord('sizeof');
      this.acceptSymbol('(');
      type = this.type();
      this.acceptSymbol(')');
      // TODO
      return;
    }

    this.restore(handle);
    if (this.tryKeyWord('sizeof') && this.trySymbol('(')) {
      this.restore(handle);
      this.acceptKeyWord('sizeof');
      type = this.unary();
      // TODO
      return;
    }

    this.restore(handle);
    switch(this.peek().value) {
      case "++" :
        this.acceptSymbol('++');
        e = this.unary();
        break;
      case "--" :
        this.acceptSymbol('--');
        e = this.unary();
        break;
      case "+"  :
        this.acceptSymbol('+');
        e = this.term();
        break;
      case "-"  :
        this.acceptSymbol('-');
        e = this.term();
        break;
      case "!"  :
        this.acceptSymbol('!');
        e = this.term();
        break;
      case "~"  :
        this.acceptSymbol('~');
        e = this.term();
        break;
      case "*"  :
        this.acceptSymbol('*');
        e = this.term();
        break;
      case "&"  :
        this.acceptSymbol('&');
        e = this.term();
        break;
      default:
        e = this.postfix();
    }
    // TODO
  }, // end of unary

  unaryLookahead: function() {
    var handle = this.getHandle();

    if (this.tryKeyWord('sizeof') && this.trySymbol('(') && 
        this.typeLookahead() && this.trySymbol(')')) {
      return true;
    }

    this.restore(handle);
    if (this.tryKeyWord('sizeof') && this.unaryLookahead()) {
      return true;
    }

    this.restore(handle);
    switch(this.peek().value) {
      case "++" :
        this.acceptSymbol('++');
        if (!this.unaryLookahead()) return false;
        break;
      case "--" :
        this.acceptSymbol('--');
        if (!this.unaryLookahead()) return false;
        break;
      case "+"  :
        this.acceptSymbol('+');
        if (!this.termLookahead()) return false;
        break;
      case "-"  :
        this.acceptSymbol('-');
        if (!this.termLookahead()) return false;
        break;
      case "!"  :
        this.acceptSymbol('!');
        if (!this.termLookahead()) return false;
        break;
      case "~"  :
        this.acceptSymbol('~');
        if (!this.termLookahead()) return false;
        break;
      case "*"  :
        this.acceptSymbol('*');
        if (!this.termLookahead()) return false;
        break;
      case "&"  :
        this.acceptSymbol('&');
        if (!this.termLookahead()) return false;
        break;
      default:
        if (!this.postfixLookahead()) return false;
    }
    return true;
  }, // end of unaryLookahead

  postfix: function() {
    var expr, idx, memb, args;

    expr = this.primary();
    out: while (true) {
      switch(this.peek().value) {
        case '++' :
          this.acceptSymbol('++');
          // TODO
          break;
        case '--' :
          this.acceptSymbol('--');
          // TODO
          break;
        case '[' :
          this.acceptSymbol('[');
          idx = this.expr();
          this.acceptSymbol(']');
          // TODO
          break;
        case '.' :
          this.acceptSymbol('.');
          memb = this.name();
          // TODO
          break;
        case '->' :
          this.acceptSymbol('->');
          memb = this.name();
          // TODO
          break;
        case '(' :
          this.acceptSymbol('(');
          args = this.args();
          this.acceptSymbol(')');
          // TODO
          break;
        default:
          break out;
      }
    }
    // TODO
  }, // end of postfix
  
  postfixLookahead: function() {
    if(!this.primaryLookahead()) return false;
    out: while (true) {
      switch(this.peek().value) {
        case '++' :
          this.acceptSymbol('++');
          break;
        case '--' :
          this.acceptSymbol('--');
          break;
        case '[' :
          this.acceptSymbol('[');
          if (!this.exprLookahead()) return false;
          if (this.peek().value === ']') this.acceptSymbol(']');
          else return false;
          break;
        case '.' :
          this.acceptSymbol('.');
          if (!this.nameLookahed()) return false;
          break;
        case '->' :
          this.acceptSymbol('->');
          if (!this.nameLookahed()) return false;
          break;
        case '(' :
          this.acceptSymbol('(');
          if (!this.argsLookahed()) return false;
          if (this.peek().value === ')') this.acceptSymbol(')');
          else return false;
          break;
        default:
          break out;
      }
    }
    return true;
  }, // end of postfixLookahead

  args: function() {
    var args, arg;

    if (this.peek().value === ')') {
      return null;
    } else {
      arg = this.expr();
      // TODO
      while(this.peek().value === ',') {
        this.acceptSymbol(',');
        arg == this.expr();
        // TODO
      }
    }
    // TODO
  },

  argsLookahed: function() {
    if (this.peek().value === ')') {
      // do nothing
    } else {
      if (!this.exprLookahead()) return false;
      while(this.peek().value === ',') {
        this.acceptSymbol(',');
        if (!this.exprLookahead()) return false;
      }
    }
    return true;
  },

  primary: function() {
    var t, e;
    t = this.peek();
    if (t.value === '(') {
      this.acceptSymbol('(');
      e = this.expr();
      this.acceptSymbol(')');
      return e;
    }

    switch(t.type) {
      case 'number':
        t = this.acceptNumber();
        // TODO
        break;
      case 'character':
        t = this.acceptCharacter();
        // TODO
        break;
      case 'string':
        t = this.acceptString();
        // TODO
        break;
      case 'identifier':
        t = this.acceptIdentifier();
        // TODO
        break;
      default:
        this.error('fail to parse primary');
    }
    return e;
  }, // end of primary

  primaryLookahead: function() {
    var t;
    var handle = this.getHandle();
    if (this.trySymbol('(') && this.exprLookahead() && this.trySymbol(')')) {
      return true;
    }

    this.restore(handle);
    t = this.peek();
    switch(t.type) {
      case 'number':
        t = this.acceptNumber();
        break;
      case 'character':
        t = this.acceptCharacter();
        break;
      case 'string':
        t = this.acceptString();
        break;
      case 'identifier':
        t = this.acceptIdentifier();
        break;
      default:
        return false;
    }
    return true;
  }, // end of primaryLookahead
 
  acceptKeyWord: function(value) {
    return this.ts.accept('keyWord', value);
  },

  acceptSymbol: function(value) {
    return this.ts.accept('symbol', value);
  },

  acceptIdentifier: function() {
    return this.ts.accept('identifier');
  },

  acceptNumber: function() {
    return this.ts.accept('number');
  },

  acceptCharacter: function() {
    return this.ts.accept('character');
  },

  acceptString: function() {
    return this.ts.accept('string');
  },

  peek: function(num) {
    return this.ts.peek(num);
  },

  tryKeyWord: function(value) {
    if (this.peek().type === 'keyword' && this.peek().value === value) {
      this.acceptKeyWord(value);
      return true;
    } else {
      return false;
    }
  },

  trySymbol: function(value) {
    if (this.peek().type === 'symbol' && this.peek().value === value) {
      this.acceptSymbol(value);
      return true;
    } else {
      return false;
    }
  },

  tryIdentifier: function() {
    if (this.peek().type === 'identifier') {
      this.acceptIdentifier();
      return true;
    } else {
      return false;
    }
  },

  tryNumber: function() {
    if (this.peek().type === 'number') {
      this.acceptNumber();
      return true;
    } else {
      return false;
    }
  },

  tryCharacter: function() {
    if (this.peek().type === 'character') {
      this.acceptCharacter();
      return true;
    } else {
      return false;
    }
  },

  tryString: function() {
    if (this.peek().type === 'string') {
      this.acceptString();
      return true;
    } else {
      return false;
    }
  },

  getHandle: function() {
    return this.ts.getHandle();
  },

  restore: function(handle) {
    this.ts.restore(handle);
  },

  location: function(token) {
    //TODO
  },

  isType: function(name) {
    return this.knownTypedefs.has(name);
  },

  addType: function(name) {
    this.knownTypedefs.add(name);
  },

  error: function(msg) {
    ErrorHandler.error("parser error",
                       this.options.fileName,
                       this.peek().lineno,
                       this.peek().colno,
                       msg)
  }
}

