var fs = require('fs');
var path = require('path');
var Compiler = require('./compiler/Compiler').Compiler;
var visitor = require('./visitor/index');
var ASTPrinter = visitor.ASTPrinter;
var IRPrinter = visitor.IRPrinter;
var cmdParse = require('./util/cmdParser');

var astPrinter = new ASTPrinter();
var irPrinter = new IRPrinter();
var argv = cmdParse(process.argv);
var cwd = process.cwd();

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

var compiler = new Compiler();

var filesResult = compiler.compile(files);

filesResult.forEach(function(obj) {
  if (argv.isDumpTokens) {
    console.log(obj.tokens);
    return;
  }

  if (argv.isDumpAST) {
    astPrinter.print(obj.ast);
    return;
  }

  if (argv.isDumpIR) {
    irPrinter.print(obj.ir);
    return;
  }

  if (argv.isDumpASM) {
    // console.log(obj.asm);
    console.log(obj.asm.toSource());
    return;
  }

  if (argv.genAssembly || argv.outputPath) {
    fs.writeFileSync(path.resolve(cwd, obj.fileName.replace('.cb', '.s')), 
                     obj.asm.toSource());
    if (argv.genAssembly) return;
  }

  if (argv.genObject || argv.outputPath) {
    compiler.platform.assembler()
            .assemble(path.resolve(cwd, obj.fileName.replace('.cb', '.s')),
                      path.resolve(cwd, obj.fileName.replace('.cb', '.o')));
    if(argv.genObject) return;
  }
});

// link
if (argv.outputPath != '.') {
  var filePaths = files.map(function(file) {
    return path.resolve(cwd, file.options.fileName).replace('.cb', '.o');
  })
  compiler.platform.linker().generateExecutable(filePaths ,argv.outputPath);
}

