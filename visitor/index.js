/*========================================
=            Abstract Visitor            =
========================================*/
module.exports.ASTVisitor = require('./AbstractVisitor/ASTVisitor');
module.exports.IRVisitor  = require('./AbstractVisitor/IRVisitor');
module.exports.EntityVistor = require('./AbstractVisitor/EntityVisitor');
module.exports.DeclarationVisitor = require('./AbstractVisitor/DeclarationVisitor');
module.exports.ASMVisitor = require('./AbstractVisitor/ASMVisitor');
/*=====  End of Abstract Visitor  ======*/


/*===============================
=            Printer            =
===============================*/
module.exports.ASTPrinter = require('./Printer/ASTPrinter');
module.exports.IRPrinter = require('./Printer/IRPrinter');
/*=====  End of Printer  ======*/


/*========================================
=            Semantic Checker            =
========================================*/
module.exports.LocalResolver = require('./SemanticChecker/LocalResolver');
module.exports.TypeResolver = require('./SemanticChecker/TypeResolver');
module.exports.DereferenceChecker = require('./SemanticChecker/DereferenceChecker');
module.exports.TypeChecker = require('./SemanticChecker/TypeChecker');
/*=====  End of Semantic Checker  ======*/


/*================================
=            Optimizer           =
================================*/

module.exports.ConstantFolder = require('./Optimizer/ConstantFolder');

/*=====  End of Optimizer  ======*/


/*=================================
=            Generator            =
=================================*/
module.exports.IRGenerator = require('./Generator/IRGenerator');
module.exports.X86CodeGenerator = require('./Generator/X86CodeGenerator');
/*=====  End of Generator  ======*/


