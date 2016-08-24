var Op = {};
module.exports = Op;


Op.ADD = 'ADD',
Op.SUB = 'SUB',
Op.MUL = 'MUL',
Op.S_DIV = 'S_DIV',
Op.U_DIV = 'U_DIV',
Op.S_MOD = 'S_MOD',
Op.U_MOD = 'U_MOD',
Op.BIT_AND = 'BIT_AND',
Op.BIT_OR = 'BIT_OR',
Op.BIT_XOR = 'BIT_XOR',
Op.BIT_LSHIFT = 'BIT_LSHIFT',
Op.BIT_RSHIFT = 'BIT_RSHIFT',
Op.ARITH_RSHIFT = 'ARITH_RSHIFT',

Op.EQ = 'EQ',
Op.NEQ = 'NEQ',
Op.S_GT = 'S_GT',
Op.S_GTEQ = 'S_GTEQ',
Op.S_LT = 'S_LT',
Op.S_LTEQ = 'S_LTEQ',
Op.U_GT = 'U_GT',
Op.U_GTEQ = 'U_GTEQ',
Op.U_LT = 'U_LT',
Op.U_LTEQ = 'U_LTEQ',

Op.UMINUS = 'UMINUS',
Op.BIT_NOT = 'BIT_NOT',
Op.NOT = 'NOT',

Op.S_CAST = 'S_CAST',
Op.U_CAST = 'U_CAST';

Op.internBinary = function(op, isSigned) {
  // String op, boolean isSigned
  if (op === "+") {
    return Op.ADD;
  } else if (op === "-") {
    return Op.SUB;
  } else if (op === "*") {
    return Op.MUL;
  } else if (op === "/") {
    return isSigned ? Op.S_DIV : Op.U_DIV;
  } else if (op === "%") {
    return isSigned ? Op.S_MOD : Op.U_MOD;
  } else if (op === "&") {
    return Op.BIT_AND;
  } else if (op === "|") {
    return Op.BIT_OR;
  } else if (op === "^") {
    return Op.BIT_XOR;
  } else if (op === "<<") {
    return Op.BIT_LSHIFT;
  } else if (op === ">>") {
    return isSigned ? Op.ARITH_RSHIFT : Op.BIT_RSHIFT;
  } else if (op === "==") {
    return Op.EQ;
  } else if (op === "!=") {
    return Op.NEQ;
  } else if (op === "<") {
    return isSigned ? Op.S_LT : Op.U_LT;
  } else if (op === "<=") {
    return isSigned ? Op.S_LTEQ : Op.U_LTEQ;
  } else if (op === ">") {
    return isSigned ? Op.S_GT : Op.U_GT;
  } else if (op === ">=") {
    return isSigned ? Op.S_GTEQ : Op.U_GTEQ;
  } else {
    throw new Error("unknown binary op: " + op);
  }
}

Op.internUnary = function(op, isSigned) {
  if (op === "+") {
    throw new Error("unary+ should not be in IR");
  } else if (op === "-") {
    return Op.UMINUS;
  } else if (op === "~") {
    return Op.BIT_NOT;
  } else if (op === "!") {
    return Op.NOT;
  } else {
    throw new Error("unknown unary op: " + op);
  }
}
