var $extend = require('../util/extend');
var $import = require('../util/import');
var BasicBlock = require('./BasicBlock');
var LabelStmt = require('../ir/LabelStmt');
module.exports = BBS;

function BBS() {
  this._bbs = []; // BasicBlock[]
  this._succ = new Map();
  this._pred = new Map();
}

BBS.prototype = {
  build: function(stmts) {
    this._bbs = [];
    var curBlock = new BasicBlock();
    for (var stmt of stmts) {
      if (stmt instanceof LabelStmt) {
        this._bbs.push(curBlock);
        curBlock = new BasicBlock();
      }
      curBlock.append(stmt);
    }
    this._bbs.push(curBlock);
  },

  insertBlock: function() {

  },

  deleteBlock: function() {

  },

  succ: function() {

  },

  pred: function() {

  }
};
