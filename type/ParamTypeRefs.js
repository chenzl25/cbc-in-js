var $extend = require('../util/extend');
var $import = require('../util/import');
var ParamSlots = require('../entity/ParamSlots');
var ParamTypes = require('./ParamTypes');
module.exports = ParamTypeRefs;

$extend(ParamTypeRefs, ParamSlots);
function ParamTypeRefs(loc, paramDescs, vararg) {
  // Location loc, List<TypeRef> paramDescs, boolean vararg
  ParamTypeRefs.super.call(this, loc, paramDescs, vararg);
};

$import(ParamTypeRefs.prototype, {
  typerefs: function() {
    return this._paramDescriptors;
  },

  /**
   * @param {Object} table // TypeTable
   */

  internTypes: function(table) {
    types = [];
    for (var ref of this._paramDescriptors) {
      types.push(table.getParamType(ref));
    }
    return new ParamTypes(this._location, types, this._vararg);
  },

  equals: function(other) {
    if (!(other instanceof ParamTypeRefs)) return false;
    if (this._vararg !== other._vararg) return false;
    if (this._paramDescriptors.length !== other._paramDescriptors.length) return false;
    for (var i = 0; i < this._paramDescriptors.length; i++) {
      if (!this._paramDescriptors[i].equals(other._paramDescriptors[i])) {
        return false;
      }
    }
    return true;
  },


});
