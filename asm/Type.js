var Type = {};
module.exports = Type;

/**
 * @param {Number} size
 * @return {String}
 */

Type.get = function(size) {
  switch(size) {
    case 1:
      return 'INT8';
    case 2:
      return 'INT16';
    case 4:
      return 'INT32';
    case 8:
      return 'INT64';
    default:
      throw new Error("unsupported asm type size: " + size)
  }
}
