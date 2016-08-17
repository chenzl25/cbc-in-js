var $extend = require('../util/extend');
var $import = require('../util/import');
var ParamSlots = require('../entity/ParamSlots');
module.exports = ParamTypes;

$extend(ParamTypes, ParamSlots);
function ParamTypes(loc, paramDescs, vararg) {
  // Location loc, Type[] paramDescs, boolean vararg
  ParamTypes.super.call(this, loc, paramDescs, vararg);
};

$import(ParamTypes.prototype, {
  /**
   * @return {Array} // Type
   */

  types: function() {
     return this._paramDescriptors;
  },

  isSameType: function(other) {
    if (! (other instanceof ParamTypes)) return false;
    if (this._vararg != other.vararg) return false;
    if (this.minArgc() != other.minArgc()) return false;
    for (var i = 0; i < this._paramDescriptors.length; i++) {
      if (! this._paramDescriptors[i].isSameType(other._paramDescriptors[i])) {
        return false;
      }
    }
    return true;
  },

  equals: function(other) {
    if (! (other instanceof ParamTypes)) return false;
    if (this._vararg !== other._vararg) return false;
    if (this._paramDescriptors.length !== other._paramDescriptors.length) return false;
    for (var i = 0; i < this._paramDescriptors.length; i++) {
      if (!this._paramDescriptors[i].equals(other._paramDescriptors[i])) {
        return false;
      }
    }
    return true;
  }
});
