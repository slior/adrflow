/**
 * Definition and functions for ADR files
 * @module
 */
"use strict"

let path = require('path')
let walker = require('klaw-sync')
let customizations = require("../customization.js").customizations
let common = require("../commands/common.js")
let fs = require('fs-extra')

let defaultADRFileRE = /^(\d+)[- ]([\w_ -]+)\.md$/

/**
 * Return a list of all the ADR files in the given directory (including sub directories)
 * 
 * @param {string} _adrDir The (root) directory containing all the ADR files.
 * 
 * @returns {string[]} List of paths to the files.
 */
let allADRFiles = (_adrDir) => {
    let adrDir = _adrDir || resolveADRDir()
    let adrFilter = file => defaultADRFileRE.test(path.basename(file.path))
    return walker(adrDir, {filter : adrFilter}).map(f => f.path)
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
    let matchingFile = adrFiles.find(f =>  { 
        try {
            return filenameDef().idFromName(path.basename(f)) === adrID*1 //we expect the ADR ID to be a number, hence the adrID*1.
        }
        catch (e) { return false } 
    })
    if (!matchingFile) {
        console.error(`Error: invalid ID ${adrID}`)
        throw new Error(`Could not find ADR file for ADR ${adrID}`)
    }
    else
        return matchingFile
}

/**
 * Given an ADR ID, return its full file name
 * 
 * @param {number} adrID The ID of the ADR to which we're looking for the filename
 * @param {string[]} _adrFiles The list of files to look in. Option; if none is given, the list of all ADRs is resolved and used.
 * 
 * @returns {string} The full path to the ADR file
 * 
 * @see allADRFiles
 */
let filenameFor = (adrID,_adrFiles) => path.basename(fullPathTo(adrID,_adrFiles || allADRFiles()))


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

var _resolvedFilenameDef = null

function filenameDef() 
{
    if (_resolvedFilenameDef === null)
        _resolvedFilenameDef = resolveFilenameDefinition(resolveADRDir())
    return _resolvedFilenameDef
}

let resolveADRDir = startFrom => {
    let start = startFrom || '.'
    let adrMarkerFilter = file => path.basename(file.path) === common.adrMarkerFilename
    let markerFilesFound = walker(start,{filter : adrMarkerFilter, nodir : true})
    if (markerFilesFound.length < 1)
        throw new Error(`No ADR directory found from ${start}`)
    else
        return path.dirname(markerFilesFound[0].path)
}

/**
 * Given an ADR (base) file name - return an object with the same file name + the extracted ID
 * @package
 * 
 * @param {string} filename - The base file name of the ADR file.
 * @returns an object with the file name (key = 'filename') and the numeric ID of the ADR (key = 'id').
 */
let adrFilenameToIndexedFilename = filename => {
    return { id : filenameDef().idFromName(filename), filename : filename}
  }


function contentFromFile(adrFilename) 
{
    return fs.readFileSync(adrFilename).toString()
}

module.exports = {
    filenameFor : filenameFor
    , allADRFiles : allADRFiles
    , fullPathTo : fullPathTo
    , resolveFilenameDefinition : resolveFilenameDefinition
    , resolveADRDir : resolveADRDir
    , indexedADRFile : adrFilenameToIndexedFilename
    , filenameDef : filenameDef
    , contentOf : contentFromFile
}