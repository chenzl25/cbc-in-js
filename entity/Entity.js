module.exports = Entity;

function Entity(priv, type, name) {
  this.isPrivate = priv;
  this.typeNode = type;
  this.name = name;
  
};