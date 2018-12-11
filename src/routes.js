import shell from "shelljs"
import fs from "fs"
import path from "path"
import { isValid, exec, errorMessage } from "./helper"

const analyzeRouter = async function(req, res, next){
    const { disableDetectors, enableDetectors, source: { sources, target }, data } = req.body

    const contract = sources[target].content;
    const fileName = target.split('/').pop();
    const fileDir = `${path.dirname(target)}`;
    shell.mkdir('-p', fileDir);
    const filePath = fileDir + '/'+fileName;
    const outputFile = `${path.dirname(target)}/output.json`

    let response = {
        "output": null,
        "error": null
    }

    let cmd = `slither ${filePath} --disable-solc-warnings --json ${outputFile}`

    if(enableDetectors){
        cmd = `${cmd} --detect ${enableDetectors}`
    }

    // exlude naming-convention for now
    // no description field
    if(disableDetectors){
        cmd = `${cmd} --exclude naming-convention,${disableDetectors}`
    } else {
        cmd = `${cmd} --exclude naming-convention`
    }

    try {
        fs.writeFileSync(filePath, contract);
        let {stdout, stderr} = await exec(cmd)

        // parse json file and return response
        const data = fs.readFileSync(outputFile)

        if(isValid(stdout)) response["output"] = stdout
        if(isValid(stderr)) response["error"] = data
        
        return res.status(200).json(response)

    } catch(error) {
                
        let data = JSON.parse(fs.readFileSync(outputFile, 'utf8'))
        // console.log(fs.readFileSync(outputFile, 'utf8'))
        response.error = data

        return res.status(500).json(response)

    } finally {
        // delete file
        await fs.unlinkSync(filePath)
        await fs.unlinkSync(outputFile)
    }
}

export {
    analyzeRouter
}