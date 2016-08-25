var fs = require('fs');
var path = require('path');
var compile = require('./compiler/Compiler');
var visitor = require('./visitor/index');
var ASTPrinter = visitor.ASTPrinter;
var IRPrinter = visitor.IRPrinter;
var cmdParse = require('./util/cmdParser');

var astPrinter = new ASTPrinter();
var irPrinter = new IRPrinter();
var argv = cmdParse(process.argv);


var files = argv.files.filter(function(fileName) {
  if (fileName.slice(-3) === '.cb') {
    return true;
  } else {
    throw('file suffix should be .cb');
  }
}).map(function(fileName) {
    var result = {};
    result.src = fs.readFileSync(fileName, "utf8");
    result.options =  {};
    result.options.fileName = path.basename(fileName);
    result.options.dirPath = path.dirname(fileName);
    return result;
})

var filesResult = compile(files);

filesResult.forEach(function(obj) {
  if (argv.isDumpTokens) {
    console.log(obj.tokens);
  }
  if (argv.isDumpAST) {
    astPrinter.print(obj.ast);
  }
  if (argv.isDumpIR) {
    irPrinter.print(obj.ir);
  }
  if (argv.isDumpASM) {

  }
});

