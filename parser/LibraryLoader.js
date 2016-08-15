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
  this.loadingLibraries = {};
  this.loadedLibraries = {};
  this.options = options;
  this.addDefaultPath();
}

LibraryLoader.prototype = {
  constructor: LibraryLoader,

  addDefaultPath: function() {
    this.addPath(path.resolve(__dirname, '../import'));
    this.addPath(path.resolve(__dirname, '../lib'));
  },

  /**
   * @param {String} path      // ./d/i/r
   */

  addPath: function(path) {
    this.loadPath.push(path);
  },

  /**
   * @param {String} libid      // a.b.c
   * @param {String} curPath    // .d/i/r
   * @return {Object}                 // declaration
   */

  loadLibrary: function(libid, curPath) {
    if (this.loadedLibraries[this.fullPath(libid,curPath)]) {
      return this.loadedLibraries[this.fullPath(libid,curPath)];
    }
    // TODO avoid recursive, and add cache(full path)
    if (this.loadingLibraries[this.fullPath(libid,curPath)]) {
      throw new Error('recursive load file: ' + libid);
    } else {
      this.loadingLibraries[this.fullPath(libid,curPath)] = true;
    }
    var parser;
    var options = {fileName: libid, dirPath: this.nextCurPath(libid, curPath)};
    var str = this.searchLibrary(libid, curPath);
    var Parser = require(path.resolve(__dirname, '../parser/Parser')).Parser;
    parser = new Parser(str, this, options);
    this.loadedLibraries[this.fullPath(libid,curPath)] = parser.declarationFile();
    this.loadingLibraries[this.fullPath(libid,curPath)] = false;
    return this.loadedLibraries[this.fullPath(libid,curPath)];
  },

  searchLibrary: function(libid, curPath) {
    var searchPath = this.fullPath(libid, curPath);
    if (curPath && fs.existsSync(searchPath)) {
      return fs.readFileSync(searchPath, "utf8");
    }
    for (var p of this.loadPath) {
      searchPath = this.fullPath(libid, p);
      if (fs.existsSync(searchPath)) {
        return fs.readFileSync(searchPath, "utf8");
      }
    }
    throw new Error('no such file: ' + libid);
  },
  
  // a.b.c => a/b/c.hb
  pathReplace: function(libid) {
    return libid.replace('.', '/') + '.' + this.options.suffix;
  },

  // (a.b.c, ./d/i/r) => ./d/i/r/a/b
  nextCurPath: function(libid, curPath) {
    return  path.dirname(path.resolve(curPath, this.pathReplace(libid)));
  },

  // (a.b.c, ./d/i/r) => ./d/i/r/a/b/c.hb
  fullPath: function(libid, loadPath) {
    return path.resolve(loadPath, this.pathReplace(libid));
  }
}