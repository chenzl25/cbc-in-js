var fs = require('fs');

var lex = require("./lexer/Lexer");
var parse = require("./parser/Parser");
var LibraryLoader = require("./parser/LibraryLoader");
var loader = new LibraryLoader;

var files = fs.readdirSync('./test');

files.forEach(function(fileName) {
  if (fileName !== "switch.cb") return;
  if (fileName.slice(-3) === '.cb') {
    var str = fs.readFileSync("./test/" + fileName, "utf8");
    try {
      // var arr = lex(str, {fileName: fileName});console.log(arr);
      var options =  {fileName: fileName};
      options.dirPath = __dirname + '/test';
      var ast = parse(str, loader, options);
      // console.log(ast);
      // console.log("pass: " + fileName);
    } catch (err) {
      console.log("fail: " + fileName)
      console.log(err);
    }
  }
})
