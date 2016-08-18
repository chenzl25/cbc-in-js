var fs = require('fs');
var compile = require('./compiler/Compiler');
var ASTPrinter = require("./visitor/ASTPrinter");

var printer = new ASTPrinter();
var files = fs.readdirSync('./test');

files = files.filter(function(fileName) {
  // if (fileName !== "hello.cb") return false;
  if (fileName.slice(-3) === '.cb') {
    return true;
  }
}).map(function(fileName) {
    var result = {};
    result.src = fs.readFileSync("./test/" + fileName, "utf8");
    result.options = {};
    result.options.fileName = fileName;
    result.options.dirPath = __dirname + '/test';
    return result;
})

var filesResult = compile(files);
filesResult.forEach(function(obj) {
  // console.log(obj.tokens);
  // printer.print(obj.ast);
});

