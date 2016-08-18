var $extend = require('../util/extend');
var $import = require('../util/import');
var ASTVisitor = require('./ASTVisitor');
module.exports = IRGenerator;

$extend(IRGenerator, ASTVisitor);
function IRGenerator() {

}

$import(IRGenerator.prototype, {
  
});