var fs = require('fs');
var lex = require('../lexer/Lexer');
var parse = require('../parser/Parser');
var LibraryLoader = require('../parser/LibraryLoader');
var visitor = require('../visitor/index');
var X86Linux = require('../sysdep/x86/X86Linux');

module.exports = compile;
module.exports.Compiler = Compiler;

var loader = new LibraryLoader;

/**
 * @param  {Array}  files //    [ {src, options}, ... ]
 *                                      options->{fileName, dirPath}
 * @return {Array}  filesResult
 */

function compile(files) {
  var compiler = new Compiler();
  return compiler.compile(files);
}


function Compiler() {
  this.platform = new X86Linux();
}

Compiler.prototype = {
  /**
   * @return {Array} filesResult // [ {fileName, tokens, ast, ir, asm}, ... ]
   */

  compile: function(files) {
    var filesResult = [];
    for (var file of files) {
      try {
        var obj = {}, typeTable, irGenerator, irFlattener, codeGenerator;
        obj.fileName = file.options.fileName;
        obj.tokens = lex(file.src, file.options);
        obj.ast = parse(obj.tokens, loader, file.options);
        typeTable = this.platform.typeTable();
        this.semanticAnalyze(obj.ast, typeTable);
        irGenerator = new visitor.IRGenerator(typeTable);
        obj.ir = irGenerator.generate(obj.ast);
        this.Optimize(obj.ir);
        irFlattener = new visitor.IRFlattener(typeTable);
        irFlattener.flatten(obj.ir);
        // codeGenerator = this.platform.codeGenerator();
        // obj.asm = codeGenerator.generate(obj.ir);
        filesResult.push(obj);
      } catch (err) {
        console.log(file.options.fileName)
        console.log(err);
        console.log(err.stack);
        console.log('')
      }
    }
    return filesResult;
  },

  semanticAnalyze: function(ast, typeTable) {
    var localResolver, typeResolver, DereferenceChecker, typeChecker;

    localResolver = new visitor.LocalResolver()
    localResolver.resolve(ast);
    typeResolver = new visitor.TypeResolver(typeTable);
    typeResolver.resolve(ast);
    typeTable.semanticCheck();
    DereferenceChecker = new visitor.DereferenceChecker(typeTable);
    DereferenceChecker.check(ast);
    typeChecker = new visitor.TypeChecker(typeTable);
    typeChecker.check(ast);
  },

  Optimize: function(ir) {
    (new visitor.ConstantFolder()).optimize(ir);
  }
}

