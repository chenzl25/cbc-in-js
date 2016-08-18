var $extend = require('../util/extend');
var $import = require('../util/import');
var ASTVisitor = require('./ASTVisitor');
module.exports = TypeResolver;

$extend(TypeResolver, ASTVisitor);
function TypeResolver() {

}

$import(TypeResolver.prototype, {
  
});