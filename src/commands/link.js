"use strict"

let {modifyADR} = require('./adr_util.js')

let linkCmd = (source,link,target) => {
    if (!source) throw new Error("Source ADR not given")
    if (!target) throw new Error("Target ADR not given")
    let linkText = link || "links to"
    modifyADR(source
        //TODO: this should change to put the link before the '## Context' section.
              , sourceContent =>  `${sourceContent}
              
${source} ${linkText} ${target}`
              , src => console.info(`ADR ${src} updated.`))
}

module.exports = linkCmd