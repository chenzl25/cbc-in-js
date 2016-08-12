module.exports = Token;

function Token(type, value, lineno, colno) {
  this.type   = type   || null;
  this.value  = value  || null;
  this.lineno = lineno || null;
  this.colno  = colno  || null;
}