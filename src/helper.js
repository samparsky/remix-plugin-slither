import { isEmpty, isNull, isUndefined } from "underscore"
import {slitherVersion, detectors} from "./config"
import chalk from "chalk"
import util from "util"

const exec = util.promisify(require("child_process").exec)

const isValid = (obj) => !isEmpty(obj) && !isUndefined(obj) && !isNull(obj)
const logInfo = message => console.log(chalk.greenBright(message))
const logError = message => console.log(chalk.redBright(message))

const compareSlitherVersion = (majorVesion, minorVersion, patch ) => (
                                            (majorVesion > slitherVersion.majorVersion)
                                            ||
                                            (majorVesion == slitherVersion.majorVersion &&
                                                minorVersion > slitherVersion.minorVersion
                                            ) 
                                            || 
                                            (
                                                majorVesion == slitherVersion.majorVersion &&
                                                minorVersion == slitherVersion.minorVersion &&
                                                patch >= slitherVersion.patch
                                            )
)


const checkSlitherVersion = async (isDev) => {
    if(isDev) {
        logInfo("\n\tRunning in dev mode")
        return true
    }

    try {
        let { stdout } = await exec(`slither --version`)
        let version = (stdout.replace(/\r?\n|\r/g, "")
                        .split('.'))
                        .map( 
                            (item) => parseInt(item) 
                        )
        let checkVersion = compareSlitherVersion(...version)
        if(!checkVersion){
            logError(
                `
                    Slither Version required >= ${slitherVersion.majorVersion}.${slitherVersion.minorVersion}.${slitherVersion.patch}\n
                    Version Present: ${version.join(".")} \n
                    Please upgrade your slither "pip install slither-analyzer --upgrade"
                `
            )
            return false
        }
    } catch(e){
        logError(
            `
                Slither Installation Required
                Please install slither ${chalk.greenBright("pip install slither-analyzer")}
            `
        )
        
        return false
    }
    return true
}


const validateDetectors = async(input) => {
    const cmd       = `slither --list-detectors-json`
    let { stdout }  = await exec(cmd).catch(e=>err=e)
    let detectors = (JSON.parse(stdout)).map((item) => item['check'])
    let user_input = input.split(",")
    let difference = user_input.filter(x => !detectors.includes(x))
    return difference.length == 0
}

export { exec, isValid, checkSlitherVersion, logInfo, logError, validateDetectors }