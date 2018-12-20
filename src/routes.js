import shell from "shelljs"
import fs from "fs"
import path from "path"
import { exec } from "./helper"

const analyzeRouter = async function(req, res, next){
    const { disableDetectors, enableDetectors, source: { target }, data } = req.body

    const ast        = data['sources'][target].legacyAST
    const astContent = JSON.stringify({
        ast,
        "sourcePath": target, 
    })

    // const fileName = target.split('/').pop();
    // const filePath = fileDir + '/'+fileName;

    const fileDir    = `${path.dirname(target)}`
    const outputFile = `${fileDir}/output.json`
    const astPath    = `${fileDir}/ast.json`

    let cmd = `slither --solc-ast ${astPath} --disable-solc-warnings --json ${outputFile}`
    
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
        shell.mkdir('-p', fileDir)
        fs.writeFileSync(astPath, astContent)
        
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
        // fs.unlinkSync(filePath)
        fs.unlinkSync(astPath)
        if(unlinkOutput) fs.unlinkSync(outputFile)
    }

    return res.status(200).json(response)

}

export {
    analyzeRouter
}