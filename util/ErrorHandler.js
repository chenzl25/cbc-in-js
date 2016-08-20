module.exports = ErrorHandler;

function ErrorHandler () {
  this._errorPool = [];
}

ErrorHandler.prototype = {
  collect: function(type, fileName, line, col, msg) {
    this._errorPool.push({
            type: type,
            fileName: fileName,
            line: line,
            col: col,
            msg: msg});
  },

  hasError: function() {
    return this._errorPool.length > 0;
  },

  throw: function() {
    throw new Error(errors(this._errorPool));
  }
};

function errorMsg(type, fileName, line, col, msg) {
  m = type + "\n";
  m +=  "file: " + fileName + ", ";
  m += "line: " + line + ", ";
  m += "col: "  + col + "\n";
  m += msg;
  return m;
}

function errors(errorArr) {
  var m = "";
  for (var i = 0; i < errorArr.length; i++) {
    m += errorMsg(errorArr[i].type, 
                  errorArr[i].fileName, 
                  errorArr[i].line, 
                  errorArr[i].col,
                  errorArr[i].msg);
    m += '\n';
  }
  throw new Error(m);
}

// static method
ErrorHandler.error = function (type, fileName, line, col, msg) {
  throw new Error(errorMsg(type, fileName, line, col, msg));
}
