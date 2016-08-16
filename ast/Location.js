module.exports = Location;

function Location(fileName, line, col) {
  this._fileName = fileName;
  this._line = line;
  this._col = col;
};
