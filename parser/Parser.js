var lex = require('../lexer/Lexer');
var tokenStream = require('../lexer/TokenStream');
var ErrorHandler = require('../util/ErrorHandler');
var entity = require('../entity/index');
var type = require('../type/index');
var ast = require('../ast/index');


module.exports = parse;
module.exports.Parser = Parser;

function parse(str, loader, options) {
  var parser = new Parser(str, loader, options);
  return parser.parse();
}

function Parser(str, loader ,options) {
  var options = options || {};
  if (typeof str !== 'string') {
    throw new Error('Expected source code to be a string but got "' + (typeof str) + '"')
  }
  if (typeof options !== 'object') {
    throw new Error('Expected "options" to be an object but got "' + (typeof options) + '"');
  }

  this.ts = new tokenStream(lex(str, options), options); // tokenStream
  this.loader = loader;
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

  compilationUnit: function() {
    var t = this.peek();
    var impdecls, decls; // Declarations

    impdecls = this.importStmts();
    decls = this.topDefs();
    this.EOF();
    decls.add(impdecls);
    return new ast.AST(this.location(t), decls);
  },

  EOF: function() {
    this.ts.accept("EOF", "EOF");
  },

  declarationFile: function() {
    var impdecls, decls; // Declarations
    var funcdecl;        // UndefinedFunction
    var vardecl;         // UndefinedVariable
    var defconst;        // Constant
    var defstruct;       // StructNode
    var defunion;        // UnionNode
    var typedef;         // TypedefNode
    var handle;

    decls = new ast.Declarations();

    impdecls = this.importStmts();
    decls.add(impdecls);
    while (this.peek().type !== 'EOF') {
      handle = this.getHandle();
      if (this.tryKeyWord('extern') && this.typerefLookahead() &&
          this.tryIdentifier() && this.trySymbol('(')) {
        this.restore(handle);
        funcdecl = this.funcdecl();
        decls.addFuncdecl(funcdecl);
        continue;
      }
      this.restore(handle);
      if (this.tryKeyWord('extern') && this.typerefLookahead() &&
          this.tryIdentifier()) {
        this.restore(handle);
        vardecl = this.vardecl();
        decls.addVardecl(vardecl);
        continue;
      }
      
      this.restore(handle);
      switch(this.peek().value) {
        case 'const':
          defconst = this.defconst();
          decls.addConstant(defconst);
          break;
        case 'struct':
          defstruct =  this.defstruct();
          decls.addDefstruct(defstruct);
          break;
        case 'union':
          defunion = this.defunion();
          decls.addDefunion(defunion);
          break;
        case 'typedef':
          typedef = this.typedef();
          decls.addTypedef(typedef);
          break;
        default:
          this.error('fail to parse declarationFile');
      }
    }
    this.EOF();
    // return this.knownTypedefs; // TO DELETE
    return decls;
  }, // end of declarationFile

  funcdecl: function() {
    var ret; // TypeRef
    var n;   // String
    var ps;  // Params

    this.acceptKeyWord('extern');
    ret = this.typeref();
    n = this.name();
    this.acceptSymbol('(');
    ps = this.params();
    this.acceptSymbol(')');
    this.acceptSymbol(';');

    t = new type.FunctionTypeRef(ret, ps.parametersTypeRef());
    return new entity.UndefinedFunction(new ast.TypeNode(t), n, ps);
  },

  vardecl: function() {
    var type; // TypeNode
    var n;    // String

    this.acceptKeyWord('extern');
    type = this.type();
    n = this.name();
    this.acceptSymbol(';');
    return new entity.UndefinedVariable(type, n);
  },

  importStmts: function() {
    var libid; // String
    var decls, impdecls; // Declarations

    impdecls = new ast.Declarations();

    while(this.peek().value === 'import') {
      libid = this.importStmt();
      if (this.loader) {
        decls = this.loader.loadLibrary(libid, this.options.dirPath);
        this.addKnownTypedefs(decls.typedefs());
        impdecls.add(decls);
        // var kt = this.loader.loadLibrary(libid, this.options.dirPath);
        // var self = this;
        // kt.forEach(function(name) {
          // self.addType(name); // TO DELETE
        // })
      } else {
        this.warn("without loader");
      }
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
    }
    this.acceptSymbol(';');
    return str;
  },

  topDefs: function() {
    var decls;     // Declarations
    var defun;     // DefinedFunction
    var defvars;   // DefinedVariable[]
    var defconst;  // Constant
    var defstruct; // StructNode
    var defunion;  // UnionNode
    var typeref;   // TypedefNode
    var handle;

    decls = new ast.Declarations();

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
          decls.addDefun(defun);
        } else {
          this.restore(handle);
          defvars = this.defvars();
          decls.addDefvars(defvars);
        }
      } else {
        this.restore(handle);
        switch(this.peek().value) {
          case 'const':
            defconst = this.defconst();
            decls.addConstant(defconst);
            break;
          case 'struct':
            defstruct =  this.defstruct();
            decls.addDefstruct(defstruct);
            break;
          case 'union':
            defunion = this.defunion();
            decls.addDefunion(defunion);
            break;
          case 'typedef':
            typedef = this.typedef();
            decls.addTypedef(typedef);
            break;
          default:
            this.error('fail to parse topDefs');
        }
      }
    }
    return decls;
  }, // end of topDefs



  defun: function() {
    var priv; // Boelean
    var ret;  // TypeRef
    var n;    // String
    var ps;   // Params
    var body; // BlockNode
    
    priv=this.storage();
    this.ret=this.typeref();
    n=this.name();
    this.acceptSymbol('(');
    ps=this.params();
    this.acceptSymbol(')');
    body=this.block();

    t = new type.FunctionTypeRef(ret, ps.parametersTypeRef());
    return new entity.DefinedFunction(priv, new ast.TypeNode(t), n, ps, body);
  },
  
  params: function() {
    var t;      // Token 
    var params; // Params

    if (this.peek().value === 'void' && this.peek(1).value === ')') {
      t = this.acceptKeyWord('void');
      return new entity.Params(this.location(t), []);
    } else {
      params = this.fixedparams();
      if (this.peek().value === ',' && this.peek(1).value === '...') {
        this.acceptSymbol(',');
        this.acceptSymbol('...');
        params.acceptVarargs();
      }
    }
    return params;
  },

  fixedparams: function() {
    var params = [];        // CBCParameter[]
    var param1, param; // CBCParameter

    param1 = this.param();
    params.push(param1);
    while (this.peek().value === ',' && this.peek(1).value !== '...') {
      this.acceptSymbol(',');
      param = this.param();
      params.push(param);
    }
    return new entity.Params(param1.location(), params);
  },

  param: function() {
    var type; // TypeNode
    var n;    // String
    type = this.type();
    n = this.name();
    return new entity.CBCParameter(type, n);
  },

  block: function() {
    var t;     // Token
    var vars;  // DefinedVariable[]
    var stmts; //  StmtNode[]
    t = this.acceptSymbol('{');
    vars = this.defvarList();
    stmts = this.stmts(); 
    this.acceptSymbol('}');

    return new ast.BlockNode(this.location(t), vars, stmts);
  },

  stmts: function() {
    var ss = []; // StmtNode[]
    var s;       // StmtNode
    var handle;

    handle = this.getHandle();
    while(this.stmtLookahead()) {
      this.restore(handle);
      s = this.stmt();
      // if stmt is ';' then s is null
      if (s) ss.push(s);
      handle = this.getHandle();
    }
    return ss;
  },

  stmt: function() {
    var s; // StmtNode
    var e; // ExprNode
    var handle;
    handle = this.getHandle();

    if (this.peek().type === 'identifier' && this.peek(1).value === ':') {
        s = this.labeledStmt();
        return s;
    }
    
    this.restore(handle);
    if (this.exprLookahead()) {
      this.restore(handle);  
      e = this.expr();
      this.acceptSymbol(';');
      console.log(e)
      s = new ast.ExprStmtNode(e.location(), e);
      return s;
    }

    this.restore(handle);
    switch(this.peek().value) {
      case ';':
        this.acceptSymbol(';');
        s = null;
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

  stmtLookahead: function() {
    var handle = this.getHandle();
    if (this.tryIdentifier() && this.trySymbol(':')) {
      return true;
    }

    this.restore(handle);
    if (this.exprLookahead() && this.trySymbol(';')) {
      return true;
    }

    this.restore(handle);

    if (this.trySymbol(';') ||
        this.trySymbol('{') ||
        this.tryKeyWord('if') ||
        this.tryKeyWord('while') ||
        this.tryKeyWord('do') ||
        this.tryKeyWord('for') ||
        this.tryKeyWord('switch') ||
        this.tryKeyWord('break') ||
        this.tryKeyWord('continue') ||
        this.tryKeyWord('goto') ||
        this.tryKeyWord('return')) {
      return true;
    } else {
      return false;
    }
  },
  
  labeledStmt: function() {
    var t; // Token
    var s; // StmtNode

    t = this.acceptIdentifier();
    this.acceptSymbol(':');
    s = this.stmt();
    return new ast.LabelNode(this.location(t), t.value, s);
  },

  ifStmt: function() {
    var t; // Token
    var cond; // ExprNode
    var thenBody, elseBody; // StmtNode

    t = this.acceptKeyWord('if');
    this.acceptSymbol('(');
    cond = this.expr();
    this.acceptSymbol(')');
    thenBody = this.stmt();
    if (this.tryKeyWord('else')) {
      elseBody = this.stmt();
    }
    return new ast.IfNode(this.location(t), cond, thenBody, elseBody);
  },

  WhileStmt: function() {
    var t; // Token
    var cond; // ExprNode
    var body; // StmtNode

    t = this.acceptKeyWord('while');
    this.acceptSymbol('(');
    cond = this.expr();
    this.acceptSymbol(')');
    body = this.stmt();
    return new ast.WhileNode(this.location(t), cond, body);
  },

  doWhileStmt: function() {
    var t; // Token
    var cond; // ExprNode
    var body; // StmtNode

    t = this.acceptKeyWord('do');
    body = this.stmt();
    this.acceptKeyWord('while');
    this.acceptSymbol('(');
    cond = this.expr();
    this.acceptSymbol(')');
    this.acceptSymbol(';');
    return new ast.DoWhileNode(this.location(t), body, cond);
  },

  forStmt: function() {
    var t; // Token
    var init, cond, incr; // ExprNode
    var body; // StmtNode

    t = this.acceptKeyWord('for');
    this.acceptSymbol('(');
    if (this.peek().value !== ';') {
      init = this.expr();
    }
    this.acceptSymbol(';');
    if (this.peek().value !== ';') {
      cond = this.expr();
    }
    this.acceptSymbol(';');
    if (this.peek().value !== ')') {
      incr = this.expr();
    }
    this.acceptSymbol(')');
    body = this.stmt();
    return new ast.ForNode(this.location(t), init, cond, incr, body);
  },

  switchStmt: function() {
    var t;      // Token
    var cond;   // ExprNode
    var bodies; // CaseNode[]
    t = this.acceptKeyWord('switch');
    this.acceptSymbol('(');
    cond = this.expr();
    this.acceptSymbol(')');
    this.acceptSymbol('{');
    bodies = this.caseClauses();
    this.acceptSymbol('}');
    return new ast.SwitchNode(this.location(t), cond, bodies);
  },

  caseClauses: function() {
    var clauses = []; // CaseNode[]
    var e;       // CaseNode
    while (this.peek().value === 'case') {
      e = this.caseClause();
      clauses.push(e);
    }
    if (this.peek().value === 'default') {
      e = this.defaultClause();
      clauses.push(e);
    }
    return clauses;
  },

  caseClause: function() {
    var vlaues; // ExprNode[]
    var body;   // BlockNode
    values = this.cases();
    body = this.caseBody();
    return new ast.CaseNode(body.location(), values, body);
  },

  cases: function() {
    var values = []; // ExprNode[]
    var e;      // ExprNode

    this.acceptKeyWord('case');
    e = this.primary();
    values.push(e);
    this.acceptSymbol(':');
    while (this.tryKeyWord('case')) {
      e = this.primary();
      this.acceptSymbol(':');
      values.push(e);
    }
    return values;
  },

  defaultClause: function() {
    var body; // BlockNode
    this.acceptKeyWord('default');
    this.acceptSymbol(':');
    body = this.caseBody();
    return new ast.CaseNode(body.location(), [], body);
  },

  caseBody: function() {
    var stmts = []; // StmtNode[]
    var s;     // StmtNode
    var handle;

    s = this.stmt();
    // if stmt is ';' then s == null
    if (s) stmts.push(s);
    handle = this.getHandle();
    while(this.stmtLookahead()) {
      this.restore(handle);
      s = this.stmt();
      // if stmt is ';' then s == null
      if (s) stmts.push(s);
      handle = this.getHandle();
    }
    if (! (stmts[stmts.length - 1] instanceof ast.BreakNode)) {
      throw new Error("missing break statement at the last of case clause");
    }
    return new ast.BlockNode(stmts[0].location(), [], stmts);
  },

  breakStmt: function() {
    var t; // Token

    t = this.acceptKeyWord('break');
    this.acceptSymbol(';');
    return new ast.BreakNode(this.location(t));
  },

  continueStmt: function() {
    var t; // Token

    t = this.acceptKeyWord('continue');
    this.acceptSymbol(';');
    return new ast.ContinueNode(this.location(t));
  },

  gotoStmt: function() {
    var t;    // Token
    var name; // String

    t = this.acceptKeyWord('goto');
    name = this.acceptIdentifier().value;
    return new ast.GotoNode(this.location(t), name);
  },

  returnStmt: function() {
    var t;    // Token
    var expr; // ExprNode

    t = this.acceptKeyWord('return');
    if (this.peek().value !== ';') {
      expr = this.expr();
    }
    this.acceptSymbol(';');
    return new ast.ReturnNode(this.location(t), expr);
  },

  defvarList: function() {
    var result = [], vars = []; // DefinedVariable[]
    var handle;
    
    while (true) {
      handle = this.getHandle();
      if (this.storageLookahead() && this.typeLookahead()) {
        this.restore(handle);
        vars = this.defvars();
        result.concat(vars);
      } else {
        this.restore(handle);
        break;
      }
    }
    return result;
  },

  defvars: function() {
    var defs = [];    // DefinedVariable[]
    var priv;         // Boolean
    var type;         // TypeNode
    var name;         // String
    var init = null;  // ExprNode

    priv = this.storage();
    type = this.type();
    name = this.name();
    if (this.peek().value === '=') {
      this.acceptSymbol('=');
      init = this.expr();
      defs.push(new entity.DefinedVariable(priv, type, name, init));
      init = null;
    }
    while (this.peek().value === ',') {
      this.acceptSymbol(',');
      name = this.name();
      if (this.peek().value === '=') {
        this.acceptSymbol('=');
        init = this.expr();
      }
      defs.push(new entity.DefinedVariable(priv, type, name, init));
      init = null;
    }
    this.acceptSymbol(';');
    return defs;
  },

  
  defconst: function() {
    var type;  // TypeNode
    var name;  // String
    var value; // ExprNode

    this.acceptKeyWord('const');
    type = this.type();
    name = this.name();
    this.acceptSymbol('=');
    value = this.expr();
    this.acceptSymbol(';');
    return new entity.Constant(type, name, value);
  },

  
  defstruct: function() {
    var t;  // Token
    var n;  // String
    var membs; // Slot[]

    t = this.acceptKeyWord('struct');
    n = this.name();
    membs = this.memberList();
    this.acceptSymbol(';');

    return new ast.StructNode(this.location(t), new type.StructTypeRef(n), n, membs);
  },

  
  defunion: function() {
    var t;  // Token
    var n;  // String
    var membs; // Slot[]

    t = this.acceptKeyWord('union');
    n = this.name();
    membs = this.memberList();
    this.acceptSymbol(';');
    return new ast.UnionNode(this.location(t), new type.UnionTypeRef(n), n, membs);
  },

  memberList: function() {
    var s; // Slot
    var membs = []; // Slot[]
    var handle;

    this.acceptSymbol("{");
    handle = this.getHandle();
    while(this.typeLookahead()) {
      this.restore(handle);
      s = this.slot();
      membs.push(s);
      this.acceptSymbol(';');
      handle = this.getHandle();
    }
    this.acceptSymbol('}');
    return membs;
  },

  slot: function() {
    var t; // TypeNode
    var n; // String
    t = this.type();
    n = this.name();
    return new ast.Slot(t, n);
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
    return new ast.TypeNode(typeref);
  },

  typeLookahead: function()  {
    return this.typerefLookahead();
  },

  typeref: function() {
    var ref;    // TypeRef
    var n;      // number
    var params  // ParamTypeRefs
    ref = this.typerefBase();
    out: while (true) {
      switch (this.peek().value) {
        case '[':
          this.acceptSymbol('[');
          if (this.peek().type === 'number') {
            n = this.acceptNumber().value;
          }
          this.acceptSymbol(']');
          ref = new type.ArrayTypeRef(ref, n);
          break;
        case '*':
          this.acceptSymbol('*');
          ref = new type.PointerTypeRef(ref);
          break;
        case '(':
          this.acceptSymbol('(');
          var params = this.paramTyperefs();
          this.acceptSymbol(')');
          ref = new type.FunctionTypeRef(ref, params);
          break;
        default:
          break out;
      }
    }
    return ref;
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
          } else if (this.peek().value === '[' &&
                     this.peek(1).value === ']') {
            this.acceptSymbol('[');
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
          if (!this.trySymbol(')')) return false;
          break;
        default:
          break out;
      }
    }
    return true;
  },

  typerefBase: function() {
    var t;    // Token
    var name; // String
    if (this.peek().value === 'unsigned') {
      this.acceptKeyWord('unsigned');
      switch(this.peek().value) {
        case 'char':
          t = this.acceptKeyWord('char');
          return type.IntegerTypeRef.ucharRef(this.location(t));
        case 'short':
          t = this.acceptKeyWord('short');
          return type.IntegerTypeRef.ushortRef(this.location(t));
        case 'int':
          t = this.acceptKeyWord('int');
          return type.IntegerTypeRef.uintRef(this.location(t));
        case 'long':
          t = this.acceptKeyWord('long');
          return type.IntegerTypeRef.ulongRef(this.location(t));
        default:
          this.error('fail to parse typerefBase1');
      }
    } else if (this.peek().type === 'identifier') {
      if (this.isType(this.peek().value)) {
        t = this.acceptIdentifier();
        name = t.value;
        return new type.UserTypeRef(this.location(t), name);
      } else {
        this.error('fail to parse typerefBase2');
      }
    } else {
      switch(this.peek().value) {
        case 'void':
          t = this.acceptKeyWord('void');
          return new type.VoidTypeRef(this.location(t));
        case 'char':
          t = this.acceptKeyWord('char');
          return type.IntegerTypeRef.charRef(this.location(t));
        case 'short':
          t = this.acceptKeyWord('short');
          return type.IntegerTypeRef.shortRef(this.location(t));
        case 'int':
          t = this.acceptKeyWord('int');
          return type.IntegerTypeRef.intRef(this.location(t));
        case 'long':
          t = this.acceptKeyWord('long');
          return type.IntegerTypeRef.longRef(this.location(t));
        case 'struct':
          t = this.acceptKeyWord('struct');
          name = this.acceptIdentifier().value;
          return new type.StructTypeRef(this.location(t), name);
        case 'union':
          t = this.acceptKeyWord('union');
          name = this.acceptIdentifier().value;
          return new type.UnionTypeRef(this.location(t), name);
        default:
          this.error('fail to parse typerefBase3');
      }
    }
  }, // end of typerefBase
  
  typerefBaseLookahead: function() {
    if (this.peek().value === 'unsigned') {
      this.acceptKeyWord('unsigned');
      switch(this.peek().value) {
        case 'char':
          this.acceptKeyWord('char');
          return true;
        case 'short':
          this.acceptKeyWord('short');
          return true;
        case 'int':
          this.acceptKeyWord('int');
          return true;
        case 'long':
          this.acceptKeyWord('long');
          return true;
        default:
          return false;
      }
    } else if (this.peek().type === 'identifier') {
      if (this.isType(this.peek().value)) {
        this.acceptIdentifier().value;
        return true;
      } else {
        return false;
      }
    } else {
      switch(this.peek().value) {
        case 'void':
          this.acceptKeyWord('void');
          return true;
        case 'char':
          this.acceptKeyWord('char');
          return true;
        case 'short':
          this.acceptKeyWord('short');
          return true;
        case 'int':
          this.acceptKeyWord('int');
          return true;
        case 'long':
          this.acceptKeyWord('long');
          return true;
        case 'struct':
          this.acceptKeyWord('struct');
          this.acceptIdentifier().value;
          return true;
        case 'union':
          this.acceptKeyWord('union');
          this.acceptIdentifier().value;
          return true;
        default:
          return false;
      }
    }
  },

  typedef: function() {
    var t = this.acceptKeyWord('typedef');
    var ref = this.typeref();
    var name = this.acceptIdentifier().value;
    this.acceptSymbol(';');
    
    this.addType(name);
    return new ast.TypedefNode(this.location(t), ref, name);
  },

  paramTyperefs: function() {
    var params = []; //ParamTypeRefs

    if (this.peek().value === 'void' && this.peek(1).value === ')') {
      this.acceptKeyWord('void');
      return new type.ParamTypeRefs([]);
    } else {
      params = this.fixedparamTyperefs();
      if (this.peek().value === ',' && this.peek(1).value === '...') {
        this.acceptSymbol(',');
        this.acceptSymbol('...');
        params.acceptVarargs();
      }
    }
    return params;
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
    var ref;  // TypeRef
    var refs = []; // TypeRef[]

    ref = this.typeref();
    while (this.peek().value === ',' && this.peek(1).value !== '...') {
      this.acceptSymbol(',');
      ref = this.typeref();
      refs.push(ref);
    } 
    return new type.ParamTypeRefs(refs);
  },

  fixedparamTyperefsLookahead: function() {
    if (!this.typerefLookahead()) return false;
    while (this.peek().value === ',' && this.peek(1).value !== '...') {
      this.acceptSymbol(',');
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
    var lhs, rhs, expr; // ExprNode
    var op; // String
    var handle = this.getHandle();

    if (this.termLookahead() && this.trySymbol('=')) {
      this.restore(handle);
      lhs = this.term();
      this.acceptSymbol('=');
      rhs = this.expr();
      return new ast.AssignNode(lhs, rhs);
    } 

    this.restore(handle);
    if (this.termLookahead() && this.opassignOpLookahead()) {
      this.restore(handle);
      lhs = this.term();
      op = this.opassignOp();
      rhs = this.expr();
      return new ast.OpAssignNode(lhs, op, rhs);
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
    var c, t, e; // ExprNode

    c = this.expr9();
    if (this.peek().value === '?') {
      this.acceptSymbol('?');
      t = this.expr();
      this.acceptSymbol(':');
      e = this.expr10();
      return new ast.CondExprNode(c, t, e);
    }
    return c;
  },
  
  expr10Lookahead: function() {
    if (!this.expr9Lookahead()) return false;
    if (this.peek().value === '?') {
      this.acceptSymbol('?');
      if (!this.exprLookahead()) return false;
      if (!this.trySymbol(':')) return false;
      if (!this.expr10Lookahead()) return false
    }
    return true
  },

  expr9: function() {
    var l, r;  // ExprNode

    l = this.expr8();
    while (this.peek().value === '||') {
      this.acceptSymbol('||');
      r = this.expr8();
      l = new ast.LogicalOrNode(l, r);
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
    var l, r; // ExprNode

    l = this.expr7();
    while (this.peek().value === '&&') {
      this.acceptSymbol('&&');
      r = this.expr7();
      l = new ast.LogicalAndNode(l, r);
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
    var l, r; // ExprNode

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
      l = new ast.BinaryOpNode(l, op, r);
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
    var l, r; // ExprNode

    l = this.expr5();
    while (this.peek().value === '|') {
      this.acceptSymbol('|');
      r = this.expr5();
      l = new ast.BinaryOpNode(l, '|', r);
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
    var l, r; // ExprNode

    l = this.expr4();
    while (this.peek().value === '^') {
      this.acceptSymbol('^');
      r = this.expr4();
      l = new ast.BinaryOpNode(l, '^', r);
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
    var l, r; // ExprNode

    l = this.expr3();
    while (this.peek().value === '&') {
      this.acceptSymbol('&');
      r = this.expr3();
      l = new ast.BinaryOpNode(l, '&', r);
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
    var l, r; // ExprNode

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
      l = new ast.BinaryOpNode(l, op, r);
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
    var l, r; // ExprNode

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
      l = new ast.BinaryOpNode(l, op, r);
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
    var l, r; // ExprNode

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
      l = new ast.BinaryOpNode(l, op, r);
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
    var type  // TypeNode
    var e;    // ExprNode
    var handle = this.getHandle();

    if (this.trySymbol('(') && this.typeLookahead()){
      this.restore(handle);
      this.acceptSymbol('(');
      type = this.type();
      this.acceptSymbol(')');
      e = this.term();
      e = new ast.CastNode(type, e);
    } else {
      this.restore(handle);
      e = this.unary();
    }
    return e;
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
    var type;   // TypeNode
    var e;      // ExprNode
    var handle;
    handle = this.getHandle();

    if (this.tryKeyWord('sizeof') && this.trySymbol('(') && this.typeLookahead()) {
      this.restore(handle);
      this.acceptKeyWord('sizeof');
      this.acceptSymbol('(');
      type = this.type();
      this.acceptSymbol(')');
      return new ast.SizeofTypeNode(t, this.sizeT());
    }

    this.restore(handle);
    if (this.tryKeyWord('sizeof')) {
      this.restore(handle);
      this.acceptKeyWord('sizeof');
      type = this.unary();
      return new ast.SizeofExprNode(e, this.sizeT());
    }

    this.restore(handle);
    switch(this.peek().value) {
      case "++" :
        this.acceptSymbol('++');
        e = this.unary();
        e = new ast.PrefixOpNode('++', e);
        break;
      case "--" :
        this.acceptSymbol('--');
        e = this.unary();
        e = new ast.PrefixOpNode('--', e);
        break;
      case "+"  :
        this.acceptSymbol('+');
        e = this.term();
        e = new ast.UnaryOpNode('+', e);
        break;
      case "-"  :
        this.acceptSymbol('-');
        e = this.term();
        e = new ast.UnaryOpNode('-', e);
        break;
      case "!"  :
        this.acceptSymbol('!');
        e = this.term();
        e = new ast.UnaryOpNode('!', e);
        break;
      case "~"  :
        this.acceptSymbol('~');
        e = this.term();
        e = new ast.UnaryOpNode('~', e);
        break;
      case "*"  :
        this.acceptSymbol('*');
        e = this.term();
        e = new ast.DereferenceNode(e);
        break;
      case "&"  :
        this.acceptSymbol('&');
        e = this.term();
        e = new ast.AddressNode(e);
        break;
      default:
        e = this.postfix();
    }
    return e;
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
    var expr, idx; // ExprNode
    var memb;      // String
    var args;      // ExprNode[]

    expr = this.primary();
    out: while (true) {
      switch(this.peek().value) {
        case '++' :
          this.acceptSymbol('++');
          expr = new ast.SuffixOpNode("++", expr);
          break;
        case '--' :
          this.acceptSymbol('--');
          expr = new ast.SuffixOpNode("--", expr);
          break;
        case '[' :
          this.acceptSymbol('[');
          idx = this.expr();
          this.acceptSymbol(']');
          expr = new ast.ArefNode(expr, idx); 
          break;
        case '.' :
          this.acceptSymbol('.');
          memb = this.name();
          expr = new ast.MemberNode(expr, memb);
          break;
        case '->' :
          this.acceptSymbol('->');
          memb = this.name();
          expr = new ast.PtrMemberNode(expr, memb);
          break;
        case '(' :
          this.acceptSymbol('(');
          args = this.args();
          this.acceptSymbol(')');
          expr = new ast.FuncallNode(expr, args);
          break;
        default:
          break out;
      }
    }
    return expr
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
          if (!this.trySymbol(']')) return false;
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
          if (!this.trySymbol(')')) return false;
          break;
        default:
          break out;
      }
    }
    return true;
  }, // end of postfixLookahead

  args: function() {
    var args = []; // ExprNode[]
    var arg;       // ExprNode

    if (this.peek().value === ')') {
      // do nothing;
    } else {
      arg = this.expr();
      args.push(arg);
      while(this.peek().value === ',') {
        this.acceptSymbol(',');
        arg == this.expr();
        args.push(arg);
      }
    }
    return args;
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
    var t; // Token
    var e; // ExprNode

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
        e = this.integerNode(this.location(t), t.value);
        break;
      case 'character':
        t = this.acceptCharacter();
        e = new ast.IntegerLiteralNode(this.location(t), 
                                       type.IntegerTypeRef.charRef(), 
                                       t.value.charCodeAt(0));
        break;
      case 'string':
        t = this.acceptString();
        return new ast.StringLiteralNode(this.location(t),
                    new type.PointerTypeRef(type.IntegerTypeRef.charRef()),
                    t.value);
        break;
      case 'identifier':
        t = this.acceptIdentifier();
        return new ast.VariableNode(this.location(t), t.value);
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
    if (this.peek().type === 'keyWord' && this.peek().value === value) {
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
    return new ast.Location(this.options.fileName, token.lineno, token.colno);
  },

  isType: function(name) {
    return this.knownTypedefs.has(name);
  },

  addType: function(name) {
    this.knownTypedefs.add(name);
  },
  
  /**
   * @params {Array} TypedefNode
   */

  addKnownTypedefs: function(typedefs) {
    for (var n of typedefs) {
      this.addType(n.name());
    }
  },

  integerNode: function(loc, value) {
    if (value.slice(-2) === 'UL'){
      value = value.slice(-2);
      return new ast.IntegerLiteralNode(loc, type.IntegerTypeRef.ulongRef(), value);
    } else if (value.slice(-1) === 'U') {
      value = value.slice(-1);
      return new ast.IntegerLiteralNode(loc, type.IntegerTypeRef.uintRef(), value);
    } else if (value.slice(-1) === 'L') {
      value = value.slice(-1);
      return new ast.IntegerLiteralNode(loc, type.IntegerTypeRef.longRef(), value);
    } else {
      return new ast.IntegerLiteralNode(loc, type.IntegerTypeRef.intRef(), value);
    }
  },

  sizeT: function() {
    return type.IntegerTypeRef.ulongRef();
  },

  error: function(msg) {
    ErrorHandler.error("parser error",
                       this.options.fileName,
                       this.peek().lineno,
                       this.peek().colno,
                       msg)
  },

  warn: function(msg) {
    console.log("warn: " + msg);
  }
}

