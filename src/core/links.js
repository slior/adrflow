/**
 * Definition and functions for handling links between ADRs
 * @module
 */
"use strict"

let adrs = require("../adr_util_sync.js").createUtilContext()
/**
 * Given a text and a target ADR ID, return the markdown code for this link, to put in the source ADR text.
 * 
 * @param {string} linkText The text given as input, representing the relationship with the target ADR
 * @param {number} targetID The ID of the target ADR
 * 
 * @returns {string} The markdown code to appear in the source ADR
 */
let linkMD = (linkText,targetID) => 
{
    let targetFilename = adrs.filenameFor(targetID)
    return `${linkText} [${targetID}](${targetFilename})`
}


module.exports = {
    linkMarkdown : linkMD
}