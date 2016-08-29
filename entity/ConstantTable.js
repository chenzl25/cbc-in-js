var ConstantEntry = require('./ConstantEntry');
module.exports = ConstantTable;

function ConstantTable() {
  this._table = new Map(); // String -> ConstantEntry
};

ConstantTable.prototype = {
  isEmpty: function() {
    return this._table.size === 0;
  },

  intern: function(s) {
    if (this._table.has(s)) return this._table.get(s);
    var ent = new ConstantEntry(s)
    this._table.set(s, ent);
    return ent;
  },

  values: function() {
    var result = new Set();
    for (var ent of this._table.values()) {
      result.add(ent);
    }
    return result;
  }
};
