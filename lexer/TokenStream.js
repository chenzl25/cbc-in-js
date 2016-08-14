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

  peek: function (index) {
    index = index || 0;
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
    // console.log (ok, type,  this.peek().type, value, this.peek().value);
    if (type  && this.peek().type  !== type ) ok = false;
    // console.log (ok, type,  this.peek().type, value, this.peek().value);

    if (value && this.peek().value !== value) ok = false;
    // console.log (ok, type,  this.peek().type, value, this.peek().value);
    
    if (!ok) {
      ErrorHandler.error("parse error",
                         this.options.fileName, 
                         this.peek().lineno,
                         this.peek().colno,
                         "we expect token with type: " + type +
                         ", value: " + value + '\n' + 
                         "but actually type: " + this.peek().type + 
                         ", value: " + this.peek().value + "\n");
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

