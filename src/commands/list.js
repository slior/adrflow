/**
 * The `list` command
 * @module
 */

"use strict"

require('console.table')
let utils = require('../adr_util_sync.js').createUtilContext()
let {titleFromFilename: adrTitleFromFilename} = require('../adr_util_sync.js').adrFilename()

let {withAllADRFiles, indexedADRFile} = require('./adr_util.js')

let linksFrom = adrID => utils.linksFor(adrID)

let enrichedADRListItem = adrData => {
  adrData.title = adrTitleFromFilename(adrData.filename)
  adrData.links = linksFrom(adrData.id)
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
            files.forEach(f => console.info(f))
        else 
            console.table(files.map(indexedADRFile)
                               .map(enrichedADRListItem)
                        )
    })
}


module.exports = listCmd
