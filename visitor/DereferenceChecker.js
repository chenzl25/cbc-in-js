var $extend = require('../util/extend');
var $import = require('../util/import');
var ASTVisitor = require('./ASTVisitor');
module.exports = DereferenceChecker;

$extend(DereferenceChecker, ASTVisitor);
function DereferenceChecker() {

}

$import(DereferenceChecker.prototype, {
  
});