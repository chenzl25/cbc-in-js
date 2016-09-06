var path = require('path');
module.exports = parse;

/**
 * @params {Array} argv
 * @return {Object}
 */

function parse(argv) {
  var result = {};
  result.isDumpTokens = false;
  result.isDumpAST = false;
  result.isDumpIR = false;
  result.isDumpIRQ = false;  
  result.isDumpBBS = false;
  result.isDumpASM = false;
  result.genAssembly = false;
  result.outputPath = '.';
  result.genObject = false;
  result.files = [];
  for (var i = 2; i < argv.length; i++) {
    switch (argv[i]) {
      case '--dump-tokens':
        result.isDumpTokens = true;
        break;
      case '--dump-ast':
        result.isDumpAST = true;
        break;
      case '--dump-ir':
        result.isDumpIR = true;
        break;
      case '--dump-irq':
        result.isDumpIRQ = true;
        break;
      case '--dump-bbs':
        result.isDumpBBS = true;
        break;
      case '--dump-asm':
        result.isDumpASM = true;
        break;
      case '-S':
        result.genAssembly = true;
        break;
      case '-o':
        result.outputPath = argv[++i];
        break;
      case '-c':
        result.genObject = true;
        break;
      case '--help':
        printHelp();
        break;
      default:
        result.files.push(path.resolve(process.cwd(), argv[i]));
    }
  }
  return result;
}

function printHelp() {
  var str = '';
  str += 'Usage: node cbc.js [options] file...\n'
  str += 'Global Options:\n'
  str += '  --dump-tokens    Dumps tokens and quit.\n'
  str += '  --dump-ast       Dumps AST and quit.\n'
  str += '  --dump-ir        Dumps IR and quit.\n'
  str += '  --dump-asm       Dumps AssemblyCode and quit.\n'
  str += '  --print-asm      Prints assembly code and quit.\n'
  str += '  -S               Generates an assembly file and quit.\n'
  str += '  -c               Generates an object file and quit.\n'
  str += '  -o PATH          Places output in file PATH.\n'
  str += '  --help           Prints this message and quit.\n'
  console.log(str);
}
