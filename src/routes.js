import shell from "shelljs"
import fs from "fs"
import path from "path"
import { exec, validateDetectors } from "./helper"

const analyzeRouter = async function(req, res, next){
    const { detectors, source: { sources, target }, data } = req.body

    let response = {
        "output": null,
        "error": null
    }
    
    const v = await validateDetectors(detectors)
    if(!v) {
        response.error = "Invalid detectors"
        return res.status(200).json(response)
    }

    const fileDir      = `${path.dirname(target)}`
    const outputFile   = `${fileDir}/output.json`

    let cmd      = `slither --solc-ast ${fileDir}/ --splitted --detect ${detectors} --disable-solc-warnings --json ${outputFile}`

    try {
        shell.mkdir('-p', fileDir)
        
        // write ast file
        for(let source in data['sources']){
            const fileName        = (source.split('/')
                                        .pop())
                                        .split('.')
                                        .reverse()
                                        .pop()

            const ast             = data['sources'][source].legacyAST
            const astPath         = `${fileDir}/${fileName}.json`
            const astContent      = JSON.stringify({
                ast,
                "sourcePath": source, 
            })
            fs.writeFileSync(astPath, astContent)
        }

        // write .sol file
        for(let source in sources){
            const fileName        = (source.split('/')
                                        .pop())
                                        .split('.')
                                        .reverse()
                                        .pop()

            const contractContent = sources[source].content
            const contractPath    = `${fileDir}/${fileName}.sol`
            fs.writeFileSync(contractPath, contractContent)
        }
        
        // execute slither command
        let { stderr }     = await exec(cmd)
        response["output"] = stderr

    } catch(error) {
        if(fs.existsSync(outputFile)){
            let data       = JSON.parse(fs.readFileSync(outputFile, 'utf8'))
            response.error = data
        } else {
            response.error = error['message'] || "An error occured"
        }
    } finally {
        // delete all files
        shell.rm(`${fileDir}/*`)
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