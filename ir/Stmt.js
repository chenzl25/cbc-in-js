module.exports = Stmt;

function Stmt(loc) {
  // Location loc
  this._location = loc;
};

Stmt.prototype = {
  location: function() {
    return this._location;
  }
}

