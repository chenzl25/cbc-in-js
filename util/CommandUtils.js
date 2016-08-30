var execSync = require('child_process').execSync;
module.exports.invoke = invoke;

function invoke(cmd) {
  var result = execSync(cmd.join(' '), {encoding: 'utf8'});
  console.log(result);
}
