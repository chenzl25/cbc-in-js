var fs = require('fs');
var lex = require("./lexer/lexer");

var files = fs.readdirSync('./test');

files.forEach(function(fileName) {
  if (fileName.slice(-3) === '.cb') {
    var str = fs.readFileSync("./test/" + fileName, "utf8");
    try {
      var arr = lex(str);
      console.log("pass: " + fileName);
    } catch (err) {
      console.log("fail: " + fileName)
    }
  }
})


