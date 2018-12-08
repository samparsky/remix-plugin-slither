import { isEmpty, isNull, isUndefined } from "underscore"
import util from "util"

const exec = util.promisify(require("child_process").exec)

const isValid = (obj) => !isEmpty(obj) && !isUndefined(obj) && !isNull(obj)


function errorMessage(data) {
    let message = "hello world"
    const {check, type, expressions, convention  } = data

    switch(check) {
        case "suicidal":
            message = `{}.${name} (${location}) allows anyone to destruct the contract`
            break
        case "uninitialized-state":
            message = ``
            break
        case "uninitialized-storage":
            message = ``
            break
        case "arbitrary-send":
            break
        case "controlled-delegatecall":
            break
        case "reentrancy":
            break
        case "locked-ether":
            break
        case "constant-function":
            break
        case "tx-origin":
            break
        case "uninitialized-local":
            break
        case "unused-return":
            message = `${name} (${location}) does not use the value returned by external calls:`
            // for(node in )
        case "assembly":
            break
        case "constable-states":
            break
        case "external-function":
            let name = data['function']['name']
            let len = data['function']['source_mapping'].length;
            let location = `#${data['function']['source_mapping'][0]}-#${data['function']['source_mapping'][len-1]}`

            message = `${name} (${location}) should be declared external`
            break
        case "low-level-calls":
            break
        case "naming-convention":
            message = `Parameter ${name}`
            break
        case "pragma":
            break
        case "solc-version":
            break
        case "unused-state":
            break
    }

    data['message'] = message
    return data
}

export { exec, isValid, errorMessage }