/**
 * The `export` command
 *  @module
 */
"use strict"

let marked = require("marked")
let {withContentOf, withAllADRPaths, EOL} = require('./adr_util.js')
let {indexedADRFile,filenameFor,contentOf,fullPathTo} = require("../core/files.js")
let {writeFileSync} = require('fs-extra')


const ALL = '*'
const TwoNLs = EOL + EOL

let withHTMLContentFor = (id,cb) => 
    withContentOf(id, content => { cb(marked(content))} )


let writeToFileAndReport = (file,html,msg) => {
    writeFileSync(file,html)
    console.info(msg)
}

let dispatchOutput = (file,output,msg) => {
    if (file)
        writeToFileAndReport(file,output,msg)
    else 
        console.log(output)
}

let exportSingleADR = (id,destinationFile) => 
    withHTMLContentFor(id , html => dispatchOutput(destinationFile,wrappedHTML(html),`ADR ${id} has been exported to ${destinationFile}`))

let increaseHeadlineIndent = adrContent => adrContent.replace(/^#/gm,'##')

let adrHeader = adrContent => {
    let result =  /^##\s*(.+)/g.exec(adrContent)
    return (result && result[1]) || ''  //return an empty string in case there's no match
} 
let tocLineFromHeader = header => `- [${header}](#${header.replace(/[\s]+/g,'-')})`

let mdTOCFrom = mdContentArray => `# Content ${TwoNLs}` + 
                                  mdContentArray.map(adrHeader)
                                                .filter(h => h != '')
                                                .map(tocLineFromHeader)
                                                .join('  ' + EOL)

let wrappedHTML = htmlContent => `<html><body style="font-family:Arial">${htmlContent}</body></html>`

let allADRsToHTML = allIndexedADRContent => {
    //sort, extract content, and prepare for HTML
    let allMD = allIndexedADRContent.sort((f1,f2) => f1.id - f2.id)
                                            .map(f => f.content)
                                            .map(increaseHeadlineIndent)
    
    allMD.unshift(mdTOCFrom(allMD) + "<hr/>") //add table of contents in the beginning
    
    return wrappedHTML(marked(allMD.join(TwoNLs))) //concatenate everything, and transform to HTML
}

function exportFiles(files, destinationFile, alternativeSuccessMsg) 
{
    let successMsg = alternativeSuccessMsg || `All ADRs exported to ${destinationFile}`
    let fileContentWithIDs = files.map(indexedADRFile)
                                  .map(idFile => {
                                      let path = fullPathTo(idFile.id,files)
                                        return { content : contentOf(path), id : idFile.id}
                                    })
    dispatchOutput(destinationFile, allADRsToHTML(fileContentWithIDs),successMsg)
}

let exportAll = (destinationFile) => withAllADRFiles(files => exportFiles(files, destinationFile))

function parseIDs(ids)
{
    return ids.split(",").map(id => id*1)
}

/**
 * Command to export a given ADR to an HTML format
 * 
 * @param {number} id - The ID of the ADR to export
 * @param {string} destinationFile - The file to write the generated HTML. If no file is given, output is directed to standard output (`console.log`)
 */
let exportCmd = (id,destinationFile) => {
    if (id === ALL)
        exportAll(destinationFile)
    else if (!isNaN(id*1))
        exportSingleADR(id,destinationFile)
    else {
        let adrIDList = parseIDs(id)
        withAllADRPaths(files => {
            let filenames = adrIDList.map(id => filenameFor(id,files))
            exportFiles(filenames,destinationFile,`ADRs ${adrIDList} exported to ${destinationFile}`)
        })
    }
    
}

module.exports = exportCmd