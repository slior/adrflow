/**
 * Definition and functions for ADR files
 * @module
 */
"use strict"

let path = require('path')
let walker = require('klaw-sync')

let adrFileRE = /^(\d+)[- ]([\w_ -]+)\.md$/

/**
 * Return a list of all the ADR files in the given directory (including sub directories)
 * 
 * @param {string} _adrDir The (root) directory containing all the ADR files.
 * 
 * @returns {string[]} List of paths to the files.
 */
let allADRFiles = (_adrDir) => {
    let adrFilter = file => adrFileRE.test(path.basename(file.path))
    return walker(_adrDir, {filter : adrFilter}).map(f => f.path)
}

/**
 * Given an ADR ID and list of files, return the full path to the adr file corresponding to the given id.  
 * If no ADR files are given, all adr files are considered.  
 * If the ADR file is not found, an error is thrown.
 * 
 * @param {number} adrID The ID of the ADR we're looking for
 * @param {string[]} _adrFiles The list of all ADR file paths
 * 
 * @returns {string} The full path to the ADR file
 * @throws an Error in case the ADR file is not found for the given ID.
 * 
 * @see allADRFiles
 */
let fullPathTo = (adrID,_adrFiles) => {
    let adrFiles = _adrFiles || allADRFiles()
    let matchingFilenames = adrFiles.filter(f => path.basename(f).indexOf(adrID + "-") === 0)
    if (matchingFilenames.length < 1) //not found
        throw new Error(`Could not find ADR file for ADR ${adrID}`)
    else
        return matchingFilenames[0]
}

/**
 * Given an ADR ID, return its full file name
 * 
 * @param {number} adrID 
 * 
 * @returns {string} The full path to the ADR file
 */
let filenameFor = adrID => path.basename(fullPathTo(adrID,allADRFiles()))

module.exports = {
    filenameFor : filenameFor
    , allADRFiles : allADRFiles
    , fullPathTo : fullPathTo
    , adrFileRE : adrFileRE
}