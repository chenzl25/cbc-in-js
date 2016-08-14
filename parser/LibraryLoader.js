var fs = require('fs');
var path = require('path');

module.exports = LibraryLoader;

function LibraryLoader(userOptions) {
  var options = {suffix: 'hb'};
  if (userOptions) for (var idx of userOptions) options[idx] = userOptions[idx];
  if (typeof options !== 'object') {
    throw new Error('Expected "options" to be an object but got "' + (typeof options) + '"');
  }
  
  this.loadPath = []; // like ./a/b/c
  this.loadingLibraries = [];
  this.loadedLibraries = [];
  this.options = options;
  this.addDefaultPath();
}

LibraryLoader.prototype = {
  constructor: LibraryLoader,

  addPath: function(path) {
    this.loadPath.push(path);
  },
  
  addDefaultPath: function() {
    this.loadPath.push(path.resolve(__dirname, '../import'));
    this.loadPath.push(path.resolve(__dirname, '../lib'));
  },

  loadLibrary: function(libid, curPath) {
    // TODO avoid recursive, and add cache(full path)
    var parser;
    var options = {fileName: libid};
    var str = this.searchLibrary(libid, curPath);
    var Parser = require(path.resolve(__dirname, '../parser/Parser')).Parser;
    parser = new Parser(str, this, options);
    return parser.declarationFile();
  },

  searchLibrary: function(libid, curPath) {
    var replacePath = libid.replace('.', '/') + '.' + this.options.suffix;
    if (curPath && fs.existsSync(path.resolve(curPath, replacePath))) {
      return fs.readFileSync(path.resolve(curPath, replacePath), "utf8");
    }
    for (var p of this.loadPath) {
      if (fs.existsSync(path.resolve(p , replacePath))) {
        return fs.readFileSync(path.resolve(p , replacePath), "utf8");
      }
    }
    throw new Error('no such file: ' + libid);
  }

}