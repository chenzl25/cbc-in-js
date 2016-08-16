var $extend = require('../util/extend');
var $import = require('../util/import');
var ParamSlots = require('./ParamSlots');
var ParamTypeRefs = require('../type/ParamTypeRefs');
module.exports = Params;

$extend(Params, ParamSlots);
function Params(loc, paramDescs) {
  // Location loc, CBCParameter[] paramDescs
  Params.super.call(this, loc, paramDescs, false);
};

$import(Params.prototype, {
  /**
   * @return {Array} //CBCParameter[]
   */

  parameters: function() {
    return this._paramDescriptors;
  },

  parametersTypeRef: function() {
    var typerefs = [];
    for (var param of this._paramDescriptors) {
        typerefs.push(param.typeNode().typeRef());
    }
    return new ParamTypeRefs(this._location, typerefs, this._vararg);
  },

  equals: function(other) {
    if (!(other instanceof Params)) return false;
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
