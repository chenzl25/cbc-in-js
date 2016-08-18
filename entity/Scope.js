module.exports = Scope;

function Scope() {
  this._children = []; // LocalScope[]
};

Scope.prototype = {
  isToplevel: function() {
    throw new Error('Scope abstract method call: isToplevel');
  },

  ToplevelScope: function() {
    throw new Error('Scope abstract method call: ToplevelScope');
  },

  parent: function() {
    throw new Error('Scope abstract method call: parent');
  },

  /**
   * @param {Obejct} s // LocalScope
   */
  
  addChild: function(s) {
    this._children.push(s);
  },
  
  /**
   * @return {Obejct} // Entity
   */

  get: function(name) {
    throw new Error('Scope abstract method call: get');
  }
};

