var type = require('./index');
var ErrorHandler = require('../util/ErrorHandler');
module.exports = TypeTable;

function TypeTable(intSize, longSize, pointerSize) {
  // int intSize, int longSize, int pointerSize
  this._intSize = intSize;
  this._longSize = longSize;
  this._pointerSize = pointerSize;
  this._table = new Map(); // TypeRef -> Type
  this._checking = {}; // Object for checkRecursiveDefinition
  this._checked = {};  // Object for checkRecursiveDefinition
};

TypeTable.ilp32 = function() { return TypeTable.newTable(1, 2, 4, 4, 4); }
TypeTable.ilp64 = function() { return TypeTable.newTable(1, 2, 8, 8, 8); }
TypeTable.lp64  = function() { return TypeTable.newTable(1, 2, 4, 8, 8); }
TypeTable.llp64 = function() { return TypeTable.newTable(1, 2, 4, 4, 8); }

TypeTable.newTable = function(charsize, shortsize, intsize, longsize, ptrsize) {
  var table = new TypeTable(intsize, longsize, ptrsize);
  table.put(new type.VoidTypeRef(), new type.VoidType());
  table.put(type.IntegerTypeRef.charRef(),
            new type.IntegerType(charsize,  true, "char"));
  table.put(type.IntegerTypeRef.shortRef(),
            new type.IntegerType(shortsize, true, "short"));
  table.put(type.IntegerTypeRef.intRef(),
            new type.IntegerType(intsize, true, "int"));
  table.put(type.IntegerTypeRef.longRef(),
            new type.IntegerType(longsize, true, "long"));
  table.put(type.IntegerTypeRef.ucharRef(),
            new type.IntegerType(charsize, false, "unsigned char"));
  table.put(type.IntegerTypeRef.ushortRef(),
            new type.IntegerType(shortsize, false, "unsigned short"));
  table.put(type.IntegerTypeRef.uintRef(),
            new type.IntegerType(intsize, false, "unsigned int"));
  table.put(type.IntegerTypeRef.ulongRef(),
            new type.IntegerType(longsize, false, "unsigned long"));
  return table;
}

TypeTable.prototype = {
  getByEquals: function(ref) {
    for (var key of this._table.keys()) {
      if (ref.equals(key)) {
        return this._table.get(key);
      }
    }
    return undefined;
  },

  hasByEquals: function(ref) {
    for (var key of this._table.keys()) {
      if (ref.equals(key)) {
        return true;
      }
    }
    return false;
  },

  put: function(ref, t) {
    if (this.hasByEquals(ref)) {
      this.error(null, "duplicated type definition: " + ref);
    }
    this._table.set(ref, t);
  },

  get: function(ref) {
    var tt = this.getByEquals(ref);
    if (tt == null) {
      if (ref instanceof type.UserTypeRef) {
        // If unregistered UserType is used in program, it causes
        // parse error instead of semantic error.  So we do not
        // need to handle this error.
        this.error(null, "undefined type: " + ref.name());
      } else if (ref instanceof type.PointerTypeRef) {
        var t = new type.PointerType(this._pointerSize, this.get(ref.baseType()));
        this._table.set(ref, t);
        return t;
      } else if (ref instanceof type.ArrayTypeRef) {
        var t = new type.ArrayType(this.get(ref.baseType()),
                                   ref.length(),
                                   this._pointerSize);
        this._table.set(ref, t);
        return t;
      } else if (ref instanceof type.FunctionTypeRef) {
        var t = new type.FunctionType(this.get(ref.returnType()),
                                      ref.params().internTypes(this));
        this._table.set(ref, t);
        return t;
      }
      this.error(null, "unregistered type: " + ref.toString());
    }
    return tt;
  },

  isDefined: function(ref) {
    return this.hasByEquals(ref);
  },

  // array is really a pointer on parameters.
  getParamType: function(ref) {
    var t = this.get(ref);
    return t.isArray() ? this.pointerTo(t.baseType()) : t;
  },

  intSize: function() {
    return this._intSize;
  },

  longSize: function() {
    return this._longSize;
  },

  pointerSize: function() {
    return this._pointerSize;
  },

  maxIntSize: function() {
    return this._pointerSize;
  },

  ptrDiffType: function() {
    return this.get(this.ptrDiffTypeRef());
  },

  // returns a IntegerTypeRef whose size is equals to pointer.
  ptrDiffTypeRef: function() {
    return new type.IntegerTypeRef(this.ptrDiffTypeName());
  },

  ptrDiffTypeName: function() {
    if (this.signedLong().size() == this._pointerSize) return "long";
    if (this.signedInt().size() == this._pointerSize) return "int";
    if (this.signedShort().size() == this._pointerSize) return "short";
    this.error(null, "must not happen: integer.size != pointer.size");
  },

  signedStackType: function() {
      return this.signedLong();
  },

  unsignedStackType: function() {
      return this.unsignedLong();
  },

  /**
   * @return {Array} // Type[]
   */

  types: function() {
    return this._table.values();
  },

  VoidType: function voidType() {
    return this.get(new type.VoidTypeRef());
  },

  signedChar: function() {
    return this.get(type.IntegerTypeRef.charRef());
  },

  signedShort: function() {
    return this.get(type.IntegerTypeRef.shortRef());
  },

  signedInt: function() {
    return this.get(type.IntegerTypeRef.intRef());
  },

  signedLong: function() {
    return this.get(type.IntegerTypeRef.longRef());
  },

  unsignedChar: function() {
    return this.get(type.IntegerTypeRef.ucharRef());
  },

  unsignedShort: function() {
    return this.get(type.IntegerTypeRef.ushortRef());
  },

  unsignedInt: function() {
    return this.get(type.IntegerTypeRef.uintRef());
  },

  unsignedLong: function() {
    return this.get(type.IntegerTypeRef.ulongRef());
  },

  pointerTo: function(baseType) {
    return new type.PointerType(this._pointerSize, baseType);
  },

  semanticCheck: function() {
    for (var t of this.types()) {
      // We can safely use "instanceof" instead of isXXXX() here,
      // because the type refered from UserType must be also
      // kept in this table.
      if (t instanceof type.CompositeType) {
        this.checkCompositeVoidMembers(t);
        this.checkDuplicatedMembers(t);
      } else if (t instanceof type.ArrayType) {
        this.checkArrayVoidMembers(t);
      }
      this.checkRecursiveDefinition(t);
    }
  },

  // ArrayType
  checkArrayVoidMembers: function(t) {
    if (t.baseType().isVoid()) {
      this.error(null, 'array cannot contain void');
    }
  },

  // CompositeType
  checkCompositeVoidMembers: function(t) {
    for (var s of t.members()) {
      if (s.type().isVoid()) {
        this.error(t.location(), " struct/union cannot contain void");
      }
    }
  },
  
  // CompositeType
  checkDuplicatedMembers: function(t) {
    var seen = new Set();
    for (var s of t.members()) {
      if (seen.has(s.name())) {
        this.error(t.location(), t.toString() + " has duplicated member: " + s.name())
      }
      seen.add(s.name());
    }
  },

  checkRecursiveDefinition: function(t) {
    var m = new Map(); // Type -> Object
    this._checkRecursiveDefinition(t, m);
  },

  _checkRecursiveDefinition: function(t, marks) {
    if (marks.get(t) === this._checking) {
      this.error(t.location(),  "recursive type definition: " + t);
    } else if (marks.get(t) === this._checked) {
      return;
    } else {
      marks.set(t, this._checking);
      if (t instanceof type.CompositeType) {
        for (var s of t.members()) {
          this._checkRecursiveDefinition(s.type(), marks);
        }
      } else if (t instanceof type.ArrayType) {
        this._checkRecursiveDefinition(t.baseType(), marks);
      } else if (t instanceof type.UserType) {
        this._checkRecursiveDefinition(t.realType(), marks);
      }
      marks.set(t, this._checked);
    }
  },

  error: function(location, msg) {
    if (location === null) {
      ErrorHandler.error('semantic error',
                         null,
                         null,
                         null,
                         msg);
    } else {
      ErrorHandler.error('semantic error',
                         location.fileName(),
                         location.line(),
                         location.col(),
                         msg);
    }
  }
};

