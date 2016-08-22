module.exports = ParamSlots;

function ParamSlots(loc, paramDescs, vararg) {
  // paramDescs: TypeRef[] or CBCParameter[]
  if (loc instanceof Array) {
    this._location = null;
    this._paramDescriptors = loc;
    this._vararg = false;
  } else {
    this._location = loc;
    this._paramDescriptors = paramDescs;
    this._vararg = vararg || false;
  }
};

ParamSlots.prototype = {
  argc: function() {
    if (this._vararg) throw new Error("must not happen: Param#argc for vararg");
    return this._paramDescriptors.length;
  },

  minArgc: function() {
    return this._paramDescriptors.length;
  },

  acceptVarargs: function() {
    this._vararg = true;
  },

  isVararg: function() {
    return this._vararg;
  },

  location: function() {
    return this._location;
  }
}

