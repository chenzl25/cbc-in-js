var fs = require('fs');

var lex = require('../lexer/Lexer');
var parse = require('../parser/Parser');
var LibraryLoader = require('../parser/LibraryLoader');
var visitor = require('../visitor/index');


module.exports = compile;
module.exports.Compiler = Compiler;

var loader = new LibraryLoader;

/**
 * @param  {Array}  files //    [ {src, options}, ... ]
 * @return {Array}  filesResult
 */

function compile(files) {
  var compiler = new Compiler(files);
  return compiler.compile();
}


function Compiler(files) {
  this.files = files;
}

Compiler.prototype = {
  /**
   * @return {Array} filesResult // [ {tokens, ast, ir, asm}, ... ]
   */

  compile: function() {
    var filesResult = [];
    for (var file of this.files) {
      try {
        var obj = {};
        obj.tokens = lex(file.src, file.options);
        obj.ast = parse(obj.tokens, loader, file.options);
        this.semanticAnalyze(obj.ast);
        // TODO
        obj.ir;
        obj.asm;
        filesResult.push(obj);
      } catch (err) {
        console.log(file.options.fileName)
        console.log(err);
        console.log('')
      }
    }
    return filesResult;
  },

  semanticAnalyze: function(ast) {
    var localResolver = new visitor.LocalResolver()
    localResolver.resolve(ast);
  }
}

