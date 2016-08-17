module.exports = Location;

function Location(fileName, line, col) {
  this._fileName = fileName;
  this._line = line;
  this._col = col;
};

Location.prototype = {
  fileName: function() {
    return this._fileName;
  },

  line: function() {
    return this._line;
  },

  col: function() {
    return this._col;
  }
}