var $extend = require('../util/extend');
var $import = require('../util/import');
var ASTVisitor = require('./ASTVisitor');
module.exports = codeGenerator;

$extend(codeGenerator, ASTVisitor);
function codeGenerator() {

}

$import(codeGenerator.prototype, {
  
});