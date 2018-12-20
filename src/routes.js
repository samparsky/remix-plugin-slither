import shell from "shelljs"
import fs from "fs"
import path from "path"
import { exec } from "./helper"

const analyzeRouter = async function(req, res, next){
    const { detectors, source: { sources, target }, data } = req.body

    const contractContent = sources[target].content
    const ast             = data['sources'][target].legacyAST
    const astContent      = JSON.stringify({
        ast,
        "sourcePath": target, 
    })

    const fileName     = target.split('/').pop();
    const fileDir      = `${path.dirname(target)}`
    const contractPath = `${fileDir}/${fileName}`
    const outputFile   = `${fileDir}/output.json`
    const astPath      = `${fileDir}/ast.json`

    let cmd      = `slither --solc-ast ${astPath} --detect ${detectors} --disable-solc-warnings --json ${outputFile}`
    let response = {
        "output": null,
        "error": null
    }

    let unlinkOutput = false

    try {
        shell.mkdir('-p', fileDir)
        fs.writeFileSync(contractPath, contractContent)
        fs.writeFileSync(astPath, astContent)
        
        // execute slither command
        let { stderr }     = await exec(cmd)
        response["output"] = stderr

    } catch(error) {
        if(fs.existsSync(outputFile)){
            let data       = JSON.parse(fs.readFileSync(outputFile, 'utf8'))
            unlinkOutput   = true
            response.error = data
        } else {
            response.error = error['message'] || "An error occured"
        }
    } finally {
        // delete file
        fs.unlinkSync(contractPath)
        fs.unlinkSync(astPath)
        if(unlinkOutput) fs.unlinkSync(outputFile)
    }

    return res.status(200).json(response)

}


const listDetectors = async function(req, res, next){
    let err    
    let response = {
        "output": null,
        "error": null
    }

    const cmd       = `slither --list-detectors-json`
    let { stdout }  = await exec(cmd).catch(e=>err=e)
    response.output = stdout
    if(err) response.error = err['message'] || "An error occured"

    return res.status(200).json(response)
}

export {
    analyzeRouter,
    listDetectors
}