var $extend = require('../../util/extend');
var $import = require('../../util/import');
var Assembler = require('../Assembler');
var CommandUtils = require('../../util/CommandUtils');
module.exports = GNUAssembler;

$extend(GNUAssembler, Assembler);
function GNUAssembler() {

};

$import(GNUAssembler.prototype, {
  assemble: function(srcPath, destPath, options) {
    // String srcPath, String destPath
    if (options == undefined) options = {};
    var cmd = [];
    cmd.push('as');
    cmd = cmd.concat(options.args);
    cmd = cmd.concat('-W32');
    cmd.push('-o');
    cmd.push(destPath);
    cmd.push(srcPath);
    // TODO
    CommandUtils.invoke(cmd);
  }
});
