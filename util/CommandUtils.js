var exec = require('child_process').exec;
module.exports.invoke = invoke;

function invoke(cmd) {
  exec(cmd.join(' '), (error, stdout, stderr) => {
    if (error) {
      console.error(`exec error: ${error}`);
      return;
    }
    console.log(`stdout: ${stdout}`);
    console.log(`stderr: ${stderr}`);
  });
}
