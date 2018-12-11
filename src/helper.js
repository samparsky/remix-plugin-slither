import { isEmpty, isNull, isUndefined } from "underscore"
import {slitherVersion} from "./config"
import chalk from "chalk"
import util from "util"


const exec = util.promisify(require("child_process").exec)

const isValid = (obj) => !isEmpty(obj) && !isUndefined(obj) && !isNull(obj)

const compareSlitherVersion = (majorVesion, minorVersion, patch ) => (
                                            majorVesion >= slitherVersion.majorVersion && 
                                            minorVersion >= slitherVersion.minorVersion && 
                                            patch >= slitherVersion.patch
)


const checkSlitherVersion = async (isDev) => {
    if(isDev) {
        console.log(
            chalk.greenBright("\n\tRunning in dev mode")
        )
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
            console.log(
                chalk.redBright(`
                    Slither Version required >= ${slitherVersion.majorVersion}.${slitherVersion.minorVersion}.${slitherVersion.patch}\n
                    Version Present: ${version.join(".")} \n
                    Please upgrade your slither "pip install slither-analyzer --upgrade"
                `
                )
            )
            return false
        }
    } catch(e){
        console.log(
            chalk.redBright(`
                Slither Installation Required
                Please install slither ${chalk.greenBright("pip install slither-analyzer")}
            `)
        )
        return false
    }
    return true
}
export { exec, isValid, checkSlitherVersion }