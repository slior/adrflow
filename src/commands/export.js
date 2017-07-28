"use strict"

let marked = require("marked")
let {withContentOf, withAllADRFiles, indexedADRFile, EOL, adrTitleFromFilename} = require('./adr_util.js')
let {writeFileSync} = require('fs-extra')


const ALL = '*'
const TwoNLs = EOL + EOL

let withHTMLContentFor = (id,cb) => {
    withContentOf(id, content => { cb(marked(content))} )
}

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

let exportSingleADR = (id,destinationFile) => {
    withHTMLContentFor(id , html => dispatchOutput(destinationFile,wrappedHTML(html),`ADR ${id} has been exported to ${destinationFile}`))
}

let increaseHeadlineIndent = adrContent => adrContent.replace(/^#/gm,'##')

let adrHeader = adrContent => /^##\s*(.+)/g.exec(adrContent)[1] //optimistic - assumming the match is correct
let tocLineFromHeader = header => `- [${header}](#${header.replace(/[\s]+/g,'-')})`

let mdTOCFrom = mdContentArray => `# Content ${TwoNLs}` + 
                                  mdContentArray.map(adrHeader)
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

let exportAll = (destinationFile) => {
    withAllADRFiles(files => {
        let allADRContent = []
        let finishedExtraction = () => allADRContent.length === files.length

        files.map(indexedADRFile)
             .forEach(idFile => {
                withContentOf(idFile.id, content => {
                                            allADRContent.push({id : idFile.id,content : content})
                                            if (finishedExtraction()) //TODO: there's gotta be a better way to catch this end of iteration
                                                dispatchOutput(destinationFile,allADRsToHTML(allADRContent),`All ADRs exported to ${destinationFile}`)
                                         }
                )
            })
    })
}
/**
 * Command to export a given ADR to an HTML format
 * @param {number} id - The ID of the ADR to export
 */
let exportCmd = (id,destinationFile) => {
    if (id === ALL)
        exportAll(destinationFile)
    else
        exportSingleADR(id,destinationFile)
    
}

module.exports = exportCmd