/**
 * The `search` command
 * @module
 */

"use strict"

let adrs = require("../adr_util_sync.js").createUtilContext()
let findInFiles = require("find-in-files")
let path = require('path')

/**
 * Implements the `search` command.  
 * Given a search term, this will output to the console the list of ADRs that contain the searched term.
 * 
 * @param {string} term The term to search for.
 */
let searchCmd = term => {
    findInFiles.findSync(term,adrs.adrDir,'.md$')
        .then(searchResults => {
            for (var resultFile in searchResults)
            {
                console.log(path.basename(resultFile))
                searchResults[resultFile].line
                    .map(l => "\t" + l)
                    .forEach(l => console.log(l))
                console.log("----")
            }
        })
        .catch(err => console.error(err))
        
}

module.exports = searchCmd
