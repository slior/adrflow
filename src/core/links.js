/**
 * Definition and functions for handling links between ADRs
 * @module
 */
"use strict"

let path = require('path')
let { filenameFor, filenameDef } = require("./files.js")
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
    let targetFilename = filenameFor(targetID) 
    let adrBaseFilename = path.basename(targetFilename)
    //We try to extract the title from the filename, but default to the ID in case we're not successful.
    // (a functional option/try would've been nice here)
    var mdLinkText = targetID
    try { mdLinkText = filenameDef().titleFromFilename(adrBaseFilename) }
    catch (e) { console.info(`Could not extract title from filename for ADR ${targetID}. Defaulting to target ADR ID.`)}

    return `${linkText} <!--ID:${targetID}-->[${mdLinkText}](${adrBaseFilename})`
}

/**
 * Parse the link text and return a structure the describes it.
 * The supplied regular expression should identify at least the link text and the target ADR ID.
 * 
 * 
 * @param {string} linkText The markdown text of the link
 * @param {regexp} re The regular expression used to parse the link
 * @param {function} errHandler The function (string => void) called in case the link can't be parsed
 * 
 * @returns {object} An object describing the link, with properties `text` and `target`
 */
let genericLinkParsing = (linkText,re,errHandler) => {
    const LINK_TEXT = 1 //match group #1: the text of the link
    const TARGET_ID = 2 //match group #2: the ID of the target ADR
    let matches = re.exec(linkText)
    if (!matches || matches.length < 3)
    {
        return errHandler(linkText)
    }
    else return { text : matches[LINK_TEXT], target : matches[TARGET_ID]}
}

const linkRE = /([\w_]+)[\s]+<!--ID\:([\d]+)-->[?[\w ]+\]?\((.+\.md)?\)/  //see function linkMD for expected structure
let toTargetIDAndText = (linkText) => genericLinkParsing(linkText,linkRE, lt => parseSimpleLinkText(lt))

const simpleLinkRE = /(.*)\s+([\d]+).*/
let parseSimpleLinkText = linkText =>  genericLinkParsing(linkText,simpleLinkRE,lt => {
    console.warn(`Failed to parse target link for ${lt}`)
    return {}
})

/**
 * Tests to see whether the given line is in the shape of a link
 *
 * @param {string} line Tests whether the given line is a link
 * 
 * @returns {boolean} true iff the given  line corresponds to a link
 */
let isLink = line => linkRE.test(line) || simpleLinkRE.test(line)

let statusSectionFrom = adrContent => {
    let lines = adrContent.split(/\r?\n/).map(l => l.trim())
    let statusTitleRE = /^##\s*[Ss]tatus/
    let contentTitleRE = /^##\s*[Cc]ontext/
    let statusStartInd = lines.findIndex(line => statusTitleRE.test(line))
    let statusEndInd = lines.findIndex(line => contentTitleRE.test(line))
    //TODO: handle error conditions - negative indices
    return lines.slice(statusStartInd+1,statusEndInd)
}

/**
 * Given the ADR file content, extract the link's metadata
 * 
 * @param {string} adrContent The ADR markdown content
 * @returns {object[]} The list of metadata object for the extracted links
 * 
 * @see toTargetIDAndText
 */
let linksMetadata = (adrContent) => {
    let statusUpdateRE = /\w+\s+\d{4}-\d{1,2}-\d{1,2}/ //Essentially: "word 2017-11-3" or similar
    //get all the status section content, filter out everything that's not a link, then parse and return it
    return statusSectionFrom(adrContent)
            .filter(line => line !== "")
            .filter(line => !statusUpdateRE.test(line)) //need to filter this separately, as the beginning of a status update looks like a link text with no markdown link, which is legal.
            .filter(line => isLink(line))
            .map(toTargetIDAndText)
}

/**
 * Given the ADR content, extract the links' metadata from it.
 * 
 * @param {string} adrContent The content of the ADR
 * 
 * @returns {object[]} an array of objects with the links metadata
 */
let linksFor = (adrContent) => {
    return linksMetadata(adrContent)
            .map(linkTextFromMD)
            .filter(t => t !== "")
}

/**
 * Given a link's metadata object, return the text for the link
 * 
 * @param {object} linkMD an object with the keys 'text' and 'target' signifying the link's text and target ADR id.
 * @returns {string} The text for the link, for displaying purposes.
 */
let linkTextFromMD = linkMD => `${linkMD.text} ${linkMD.target}`

module.exports = {
    linkMarkdown : linkMD
    , linksMetadata : linksMetadata
    , linksFor : linksFor
    , linkTextFromMD : linkTextFromMD
}