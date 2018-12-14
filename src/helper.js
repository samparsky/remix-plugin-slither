import { isEmpty, isNull, isUndefined } from "underscore"
import {slitherVersion, detectors} from "./config"
import chalk from "chalk"
import util from "util"

const exec = util.promisify(require("child_process").exec)

const isValid = (obj) => !isEmpty(obj) && !isUndefined(obj) && !isNull(obj)

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

const logInfo = message => console.log(chalk.greenBright(message))
const logError = message => console.log(chalk.redBright(message))

const validateDetectors = (detector) => {
    let result = detector.split(",")

    if(result.length == 1){
        let position = detectors.indexOf(result[0])
        return position != -1
    }

    result = result.forEach((value) => {
        return detectors.indexOf(value)
    })
    let position = result.indexOf(-1)
    return position != -1
}

export { exec, isValid, checkSlitherVersion, validateDetectors, logInfo, logError }