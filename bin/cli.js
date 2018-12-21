#!/usr/bin/env node

let program = require('commander');
const app = require('../dist/index.js')
const config = require("../dist/config")
const { checkSlitherVersion, logInfo } = require('../dist/helper.js')

program
    .name("slitherd")
    .version(config.version)
    .option('-p, --port <port>', 'Server port', parseInt)
    .option('-d, --dev', 'Development mode')
    .parse(process.argv);

let port = program.port || 8000
let devMode = program.dev

app.server.listen(process.env.PORT || port, async () => {
    let port = app.server.address().port

    const slitherVersion = await checkSlitherVersion(devMode);
    if(!slitherVersion) process.exit(1)

    logInfo(
        `
        Go in Remix ( https://remix.ethereum.org / https://remix-alpha.ethereum.org ) / settings tab,
        under the Plugin section paste the following declaration:\n
        {
            "title": "Slither",
            "url": "http://<machine_ip>:${port}"
        }\n
        Then start the plugin by licking on its icon.
        `
    )
});

module.exports = app