/**
 * The `link` command
 * @module
 */

"use strict"

let {modifyADR, EOL} = require('./adr_util.js')
let {linkMarkdown: linkCodeFor } = require("../core/links.js")

/**
 * Implements the `link` command.  
 * Given a source and target ADR IDs, this will link the two sources, with the given text.  
 * It will alter the source ADR text, and add the text link to that ADR.
 * 
 * @param {number} source The ID of the source ADR
 * @param {string} link The text of the link. Can be only one word (underscores are permitted). If no link is given, a default link text will be used.
 * @param {number} target The ID of the target ADR
 */
let linkCmd = (source,link,target) => {
    if (!source) throw new Error("Source ADR not given")
    if (!target) throw new Error("Target ADR not given")
    let linkText = link || "links to"
    let contextHeader = "## Context"
    modifyADR(source
              , sourceContent =>  {
                    let contextLineRE = /^##\s*Context/gm
                    let linkLine = linkCodeFor(linkText,target)
                    return sourceContent.replace(contextLineRE,`${linkLine}${EOL + EOL}${contextHeader}`)
              }
              , src => console.info(`ADR ${src} updated.`))
}

module.exports = linkCmd