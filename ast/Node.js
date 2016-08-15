module.exports = Node;

function Node() {

};

Node.prototype.location = function() {
  throw new Error('Node abstract method call: location');
}