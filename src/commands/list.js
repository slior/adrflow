/**
 * The `list` command
 * @module
 */

"use strict"

require('console.table')
let path = require('path')
let {linksFor,linkTextFromMD} = require("../core/links.js")
let { filenameDef : adrFilenameDef, contentOf} = require('../core/files.js')
let {adrMetadata} = require('../core/adrobj.js')

let {withAllADRFiles} = require('./adr_util.js')
let linksFrom = adrFilename => linksFor(contentOf(adrFilename))

/**
 * Given a structure withe the adr file name and id, return an enriched structure including also the title and links.
 * @private
 * 
 * @param {object} adrData A structure with the adr file name (`.filename`) and its id (`.id`).
 * @returns An enriched structure, also with the title (`.title`) and links (`.links`) of the ADR
 */
let enrichedADRListItem = adrData => {
  adrData.title = adrFilenameDef().titleFromFilename(adrData.filename)
  adrData.links = linksFrom(adrData.filename)
  return adrData;
}
/**
 * Implements the `list` command.  
 * This will output the list of ADR identified in the ADR directory.
 * 
 * @param {object} options The options for the list command.
 */
let listCmd = (options) => {
    let bare = options.bare || false
    withAllADRFiles(files => {
        if (bare)
            files
                .map(fullPath => path.basename(fullPath))
                .forEach(f => console.info(f))
        else 
            console.table(files
                          .map(path => adrMetadata(path))
                          .map(md => {
                            md.links = md.links.map(linkTextFromMD) //change the link metadata info to displayable information
                            return md
                          })
            )
    }
    , null
    , null)
}


module.exports = listCmd
