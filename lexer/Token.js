module.exports = Token;

function Token(name, value, lineno, colno) {
  this.name   = name   || null;
  this.value  = value  || null;
  this.lineno = lineno || null;
  this.colno  = colno  || null;
}