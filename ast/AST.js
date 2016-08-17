var $extend = require('../util/extend');
var $import = require('../util/import');
var Node = require('./Node');
var IR = require('../ir/IR');
module.exports = AST;

$extend(AST, Node);
function AST(source, declarations) {
  this._source = source; // Location
  this._declarations = declarations; // Declarations
  this._scope; // ToplevelScope
  this._constantTable; // ConstantTable
};

$import(AST.prototype, {
  location: function() {
    return this._source;
  },

  /**
   * @return {Array} //TypeDefinition[]
   */

  types: function() {
    var result = [];
    result = result.concat(this._declarations.defstructs());
    result = result.concat(this._declarations.defunions());
    result = result.concat(this._declarations.typedefs());
    return result;
  },

  /**
   * @return {Array} //Entity[]
   */

  entities: function() {
    var result = [];
    result = result.concat(this._declarations.funcdecls());
    result = result.concat(this._declarations.vardecls());
    result = result.concat(this._declarations.defvars());
    result = result.concat(this._declarations.defuns());
    result = result.concat(this._declarations.constants());
    return result;
  },

  /**
   * @return {Array} //Entity[]
   */

  declarations: function() {
    var result = [];
    result = result.concat(this._declarations.funcdecls());
    result = result.concat(this._declarations.vardecls());
    return result;
  },

  /**
   * @return {Array} //Entity[]
   */

  definitions: function() {
    var result = [];
    result = result.concat(this._declarations.defvars());
    result = result.concat(this._declarations.defuns());
    result = result.concat(this._declarations.constants());
    return result;
  },

  /**
   * @return {Array} //Constant[]
   */

  constants: function() {
    return this._declarations.constants();
  },

  /**
   * @return {Array} //definedVariables[]
   */

  definedVariables: function() {
    return this._declarations.defvars();
  },

  /**
   * @return {Array} // definedFunctions[]
   */

  definedFunctions: function() {
    return this._declarations.defuns();
  },

  /**
   * @param {Object} scope // ToplevelScope
   * called by LocalResolver
   */

  setScope: function(scope) {
    if (this._scope != null) {
      throw new Error("must not happen: ToplevelScope set twice");
    }
    this._scope = scope;
  },

  /**
   * @return {Array} // ToplevelScope[]
   */

  scope: function() {
    if (this.scope == null) {
      throw new Error("must not happen: AST.scope is null");
    }
    return this._scope;
  },

  /**
   * @param {Object} scope // ConstantTable
   * called by LocalResolver
   */

  setConstantTable(table) {
    if (this._constantTable != null) {
      throw new Error("must not happen: ConstantTable set twice");
    }
    this._constantTable = table;
  },

  /**
   * @return {Object} // ConstantTable
   */

  constantTable: function() {
    if (this._constantTable == null) {
      throw new Error("must not happen: AST.constantTable is null");
    }
    return this._constantTable;
  },

  /**
   * @return {Object} //IR
   */

  ir: function() {
    return new IR(this._source,
                  this._declarations.defvars(),
                  this._declarations.defuns(),
                  this._declarations.funcdecls(),
                  this._scope,
                  this._constantTable);
  },

});
