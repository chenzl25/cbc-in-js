var $extend = require('../../util/extend');
var $import = require('../../util/import');
var ASTVisitor = require('../AbstractVisitor/ASTVisitor');
module.exports = CodeGenerator;

$extend(CodeGenerator, ASTVisitor);
function CodeGenerator() {

}

$import(CodeGenerator.prototype, {
  
});