var $extend = require('../util/extend');
var Entity = require('./Entity');
module.exports = Variable;

$extend(Variable, Entity);
function Variable(priv, type, name) {
  // boolean priv, TypeNode type, String name
  Variable.super.call(this, priv, type, name);
};
