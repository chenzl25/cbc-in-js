module.exports.UniqueQueue = UniqueQueue;

function UniqueQueue() {
  this._queue = [];
}

UniqueQueue.prototype = {
  push: function(item) {
    if (!this._inQueue(item)) {
      this._queue.push(item);
    }
  },

  _inQueue: function(item) {
    for (var i = 0; i < this._queue.length; i++) {
      if (item === this._queue[i]) {
        return true;
      }
    }
    return false;
  },

  map: function(fun) {
    this._queue.map(fun);
  },

  filter: function(fun) {
    return this._queue.filter(fun);
  },

  pop: function() {
    return this._queue.pop();
  },

  size: function() {
    return this._queue.length;
  },

  empty: function() {
    return this._queue.length === 0;
  }
}