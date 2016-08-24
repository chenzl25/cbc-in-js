module.exports = Case;

function Case(value, label) {
  // Number value, Label label
  this._value = value;
  this._label = label;
};

Case.prototype = {
  value: function() {
    return this._value;
  },

  label: function() {
    return this._label;
  }
}
