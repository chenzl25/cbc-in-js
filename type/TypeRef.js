module.exports = TypeRef;

function TypeRef(loc) {
  this._location = loc;
};

TypeRef.prototype.location = function() {
  return this._location;
}
