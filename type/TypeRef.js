module.exports = TypeRef;

function TypeRef(loc) {
  this.location = loc;
};

TypeRef.prototype = {
  location: function() {
    return this.location;
  }
}