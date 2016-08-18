var $extend = require('../util/extend');
var $import = require('../util/import');
var ASTVisitor = require('./ASTVisitor');
module.exports = TypeChecker;

$extend(TypeChecker, ASTVisitor);
function TypeChecker() {

}

$import(TypeChecker.prototype, {
  
});