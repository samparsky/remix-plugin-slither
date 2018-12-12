import shell from "shelljs"
import fs from "fs"
import path from "path"
import { isValid, exec, validateDetectors } from "./helper"

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

    try {

        fs.writeFileSync(filePath, contract);
        // execute slither command
        let {stderr} = await exec(cmd)
        response["output"] = stderr

    } catch(error) {

        let data = JSON.parse(fs.readFileSync(outputFile, 'utf8'))
        response.error = data

    } finally {
        // delete file
        await fs.unlinkSync(filePath)
        await fs.unlinkSync(outputFile)
    }

    return res.status(200).json(response)

}

export {
    analyzeRouter
}