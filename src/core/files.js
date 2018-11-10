/**
 * Definition and functions for ADR files
 * @module
 */
"use strict"

let path = require('path')
let walker = require('klaw-sync')
let customizations = require("../customization.js").customizations

let defaultADRFileRE = /^(\d+)[- ]([\w_ -]+)\.md$/

/**
 * Return a list of all the ADR files in the given directory (including sub directories)
 * 
 * @param {string} _adrDir The (root) directory containing all the ADR files.
 * 
 * @returns {string[]} List of paths to the files.
 */
let allADRFiles = (_adrDir) => {
    let adrFilter = file => defaultADRFileRE.test(path.basename(file.path))
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


let defaultADRIDFromFilename = filename => {
    let a = defaultADRFileRE.exec(filename)
    if (!a) throw new Error(`${filename} doesn't match an ADR file pattern`)
    return a[1]*1
}

let defaultADRTitleFromFile = filename => {
    let a = defaultADRFileRE.exec(filename)
    if (!a) throw new Error(`${filename} doesn't match an ADR file pattern`)
    return a[2].split('_').join(' ')
}

/**
 * Resolve the definition of the ADR file name, if customized.  
 * If not customized, return the default implementation.
 * 
 * @param {string} resolvedADRDir The ADR directory - where the .adr file resides.
 * @returns {object} The object with all the methods necessary to define the filename
 */
function resolveFilenameDefinition(resolvedADRDir) 
{
    
    if (!resolvedADRDir) throw new Error("Missing ADR Dir for filename definition")

    let defaultDefinition = {
        matchesDefinedTemplate : name => defaultADRFileRE.test(name)
        , fromIDAndName : (id,name) => `${id}-${name}.md`
        , titleFromFilename : defaultADRTitleFromFile
        , idFromName : defaultADRIDFromFilename
    }

    let adrDir = resolvedADRDir
    let customizedDefinition = customizations(adrDir).filenameDef

    return Object.assign({},defaultDefinition,customizedDefinition)
}


module.exports = {
    filenameFor : filenameFor
    , allADRFiles : allADRFiles
    , fullPathTo : fullPathTo
    , resolveFilenameDefinition : resolveFilenameDefinition
}