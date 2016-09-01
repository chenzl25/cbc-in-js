var $extend = require('../util/extend');
var $import = require('../util/import');
var Node = require('./Node');
module.exports = StmtNode;

$extend(StmtNode, Node);
function StmtNode(loc) {
  // Location loc
  this._location = loc;
}

$import(StmtNode.prototype, {
  location: function() {
    return this._location;
  }
   
});
