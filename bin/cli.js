const program = require('commander');
const exec = require("child_process").exec

program
    .name("slitherd")
    .version("0.1.0")
    .option('-p, --port', 'Server port', parseInt)
    .parse(process.argv);

let port = program.port || 8000
let result = exec(`export PORT=${port}`)
let {stdout, stderr} = exec(`npm run dev`)
console.log(stdout)