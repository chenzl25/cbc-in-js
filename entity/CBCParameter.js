var $extend = require('../util/extend');
var $import = require('../util/import');
var DefinedVariable = require('./DefinedVariable');
module.exports = CBCParameter;


$extend(CBCParameter, DefinedVariable);
function CBCParameter(type, name) {
  // TypeNode type, String name
  CBCParameter.super.call(this, false, type, name, null);
};

CBCParameter.prototype.isParameter = function() {
  return true;
};

