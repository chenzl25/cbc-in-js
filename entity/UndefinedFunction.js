var $extend = require('../util/extend');
var $import = require('../util/import');
var Func = require('./Func');
module.exports = UndefinedFunction;

$extend(UndefinedFunction, Func);
function UndefinedFunction(t, name, params) {
  // TypeNode t, String name, Params params
  UndefinedFunction.super.call(this, false, t, name);
  this._params = params;
};

$import(UndefinedFunction.prototype, {
  /**
   * @return {Array} // Parameter[]
   */
  
  parameters: function() {
    return this._params.parameters();
  },

  isDefined: function() {
    return false;
  },
});
