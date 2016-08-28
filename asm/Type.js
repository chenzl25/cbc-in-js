var Type = {};
module.exports = Type;

/**
 * @param {Number} size
 * @return {String}
 */

Type.get = function(size) {
  switch(size) {
    case 1:
      return Type.INT8;
    case 2:
      return Type.INT16;
    case 4:
      return Type.INT32;
    case 8:
      return Type.INT64;
    default:
      console.log(size)
      throw new Error("unsupported asm type size: " + size)
  }
}

function MyEnum(sym) {
  this._sym = sym;
}

MyEnum.prototype.size = function() {
  switch (this.sym) {
    case 'INT8':
      return 1;
    case 'INT16':
      return 2;
    case 'INT32':
      return 4;
    case 'INT64':
      return 8;
    default:
        throw new Error("must not happen");
  }
}

Type.INT8 = new MyEnum('INT8');
Type.INT16 = new MyEnum('INT16');
Type.INT32 = new MyEnum('INT32');
Type.INT64 = new MyEnum('INT64');
