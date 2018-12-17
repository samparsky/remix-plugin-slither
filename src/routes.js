import shell from "shelljs"
import fs from "fs"
import path from "path"
import { exec, validateDetectors } from "./helper"

const analyzeRouter = async function(req, res, next){
    const { disableDetectors, enableDetectors, source: { sources, target }, data } = req.body

    const contract = sources[target].content;
    const fileName = target.split('/').pop();
    const fileDir = `${path.dirname(target)}`;
    const filePath = fileDir + '/'+fileName;
    const outputFile = `${path.dirname(target)}/output.json`

    let cmd = `slither ${filePath} --disable-solc-warnings --json ${outputFile}`
    
    let response = {
        "output": null,
        "error": null
    }

    if(enableDetectors){
        const result = validateDetectors(enableDetectors)
        if(!result){
            response.error = `Invalid detector present - ${enableDetectors}`
            return res.status(500).json(response)
        }
        cmd = `${cmd} --detect ${enableDetectors}`
    }

    if(disableDetectors){
        const result = validateDetectors(disableDetectors)
        if(!result){
            response.error = `Invalid detector - ${disableDetectors}`
            return res.status(500).json(response)
        }
        cmd = `${cmd} --exclude ${disableDetectors}`
    }

    let unlinkOutput = false

    try {
        shell.mkdir('-p', fileDir);
        fs.writeFileSync(filePath, contract);
        // execute slither command
        let {stderr} = await exec(cmd)
        response["output"] = stderr

    } catch(error) {
        if(fs.existsSync(outputFile)){
            let data = JSON.parse(fs.readFileSync(outputFile, 'utf8'))
            unlinkOutput = true
            response.error = data
        } else {
            response.error = error['message'] || "An error occured"
        }
    } finally {
        // delete file
        fs.unlinkSync(filePath)
        if(unlinkOutput) fs.unlinkSync(outputFile)
    }

    return res.status(200).json(response)

}

export {
    analyzeRouter
}