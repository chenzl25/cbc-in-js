var ErrorHandler = require('../util/ErrorHandler');

module.exports = TokenStream;

function TokenStream(tokens, options) {
  options = options || {};
  if (!Array.isArray(tokens)) {
    throw new TypeError('tokens must be passed to TokenStream as an array.');
  }
  if (typeof options !== 'object') {
    throw new Error('Expected "options" to be an object but got "' + (typeof options) + '"');
  }
  this._tokens = tokens;
  this.options = options;
  this.cursor = 0;
}
TokenStream.prototype = {

  constructor: TokenStream,

  lookahead: function (index) {
    index = index || this.cursor;
    if (this._tokens.length <= this.cursor + index) {
      throw new Error('Cannot read past the end of a stream');
    }
    return this._tokens[this.cursor + index];
  },

  advance: function () {
    if (this.cursor >= this._tokens.length) {
      throw new Error('Cannot read past the end of a stream');
    }
    return this._tokens[this.cursor++];
  },

  accept: function(type, value) {
    var ok = true;
    if (type  && this.lookahead().type  !== type ) ok = false;
    if (value && this.lookahead().value !== value) ok = false;
    if (!ok) {
      ErrorHandler.error("parse error",
                         options.fileName, 
                         this.lookhead().lineno,
                         this.lookhead().colno,
                         "we expect token: " + value);
    } else {
      var result = this._tokens[this.cursor];
      this.advance();
      return result;
    }
  },

  getHandle: function() {
    return this.cursor;
  },

  restore: function(handle) {
    this.cursor = handle;
  }

}

