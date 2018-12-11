const program = require('commander');
const exec = require("child_process").exec

program
    .name("slitherd")
    .version("0.1.0")
    .option('-p, --port', 'Server port', parseInt)
    .option('-d, --dev', 'Development mode')
    .parse(process.argv);

let port = program.port || 8000
let devMode = program.dev || false
let result = exec(`export PORT=${port}`)
let {stdout, stderr} = exec(`npm run dev`)
console.log(stdout)