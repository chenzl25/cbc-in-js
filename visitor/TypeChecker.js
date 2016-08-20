var $extend = require('../util/extend');
var $import = require('../util/import');
var ASTVisitor = require('./ASTVisitor');
var ErrorHandler = require('../util/ErrorHandler');
module.exports = TypeChecker;

$extend(TypeChecker, ASTVisitor);
function TypeChecker() {

}

$import(TypeChecker.prototype, {
 

});

