"use strict"

let {modifyADR, EOL} = require('./adr_util.js')

let linkCmd = (source,link,target) => {
    if (!source) throw new Error("Source ADR not given")
    if (!target) throw new Error("Target ADR not given")
    let linkText = link || "links to"
    let contextHeader = "## Context"
    modifyADR(source
              , sourceContent =>  {
                    let contextLineRE = /^##\s*Context/gm
                    let linkLine = `${linkText} ${target}`
                    return sourceContent.replace(contextLineRE,`${linkLine}${EOL + EOL}${contextHeader}`)
              }
              , src => console.info(`ADR ${src} updated.`))
}

module.exports = linkCmd