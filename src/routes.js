import shell from "shelljs"
import fs from "fs"
import path from "path"
import { exec } from "./helper"

const analyzeRouter = async function(req, res, next){
    const { disableDetectors, enableDetectors, source: { sources, target }, data } = req.body

    const contract = sources[target].content;
    const ast = JSON.stringify(data['sources'][target].legacyAST);

    const fileName = target.split('/').pop();
    const fileDir = `${path.dirname(target)}`;

    const filePath = fileDir + '/'+fileName;
    const outputFile = `${path.dirname(target)}/output.json`
    const astPath = `${path.dirname(target)}/${fileName}.ast.json`

    let cmd = `slither ${filePath} --solc-ast > ${astPath} --disable-solc-warnings --json ${outputFile}`
    
    let response = {
        "output": null,
        "error": null
    }

    if(enableDetectors){
        cmd = `${cmd} --detect ${enableDetectors}`
    }

    if(disableDetectors){
        cmd = `${cmd} --exclude ${disableDetectors}`
    }

    let unlinkOutput = false

    try {
        shell.mkdir('-p', fileDir);
        fs.writeFileSync(filePath, contract);
        fs.writeFileSync(astPath, ast)
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
        fs.unlinkSync(astPath)
        if(unlinkOutput) fs.unlinkSync(outputFile)
    }

    return res.status(200).json(response)

}

export {
    analyzeRouter
}