module.exports.error = error;

function error(type, fileName, line, col, msg) {
  m = type + "\n";
  m +=  "file: " + fileName + ", ";
  m += "line: " + line + ", ";
  m += "col: "  + col + "\n";
  m += msg;
  throw new Error(m);
}