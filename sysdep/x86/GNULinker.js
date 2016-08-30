var $extend = require('../../util/extend');
var $import = require('../../util/import');
var Linker = require('../Linker');
var CommandUtils = require('../../util/CommandUtils');
module.exports = GNULinker;

$extend(GNULinker, Linker);
function GNULinker() {
  // 32bit Linux dependent
};

GNULinker.LINKER = "/usr/bin/ld";
GNULinker.DYNAMIC_LINKER      = "/lib/ld-linux.so.2";
GNULinker.C_RUNTIME_INIT      = "/usr/lib32/crti.o";
GNULinker.C_RUNTIME_START     = "/usr/lib32/crt1.o";
GNULinker.C_RUNTIME_FINI      = "/usr/lib32/crtn.o";

$import(GNULinker.prototype, {
  generateExecutable: function(args, destPath, options) {
    // String[] args, String destPath, Object opts
    var cmd = [];
    cmd.push(GNULinker.LINKER);
    cmd.push('-dynamic-linker');
    cmd.push(GNULinker.DYNAMIC_LINKER);
    cmd.push(GNULinker.C_RUNTIME_START);
    cmd.push(GNULinker.C_RUNTIME_INIT);
    cmd = cmd.concat(args);
    cmd.push("-lc");
    cmd.push(GNULinker.C_RUNTIME_FINI);
    cmd.push('-melf_i386');
    cmd.push("-o");
    cmd.push(destPath);
    CommandUtils.invoke(cmd);
  },

  generateSharedLibrary: function(args, destPath, options) {
    // String[] args, String destPath, Object opts
    var cmd = [];
    cmd.push(GNULinker.LINKER);
    cmd.push('-shared');
    cmd.add(GNULinker.C_RUNTIME_START);
    cmd.add(GNULinker.C_RUNTIME_INIT);
    cmd = cmd.concat(args);
    cmd.push("-lc");
    cmd.add(GNULinker.C_RUNTIME_FINI);
    cmd.push('-melf_i386');
    cmd.add("-o");
    cmd.add(destPath);
    CommandUtils.invoke(cmd);
  }
});
