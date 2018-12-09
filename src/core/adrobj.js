/**
 * Definition and functions for ADR logical management and querying
 *
 * @module
 */
"use strict"

let path = require('path')
let {linksMetadata} = require("./links.js")
let {indexedADRFile, filenameDef, allADRFiles, fullPathTo, contentOf} = require("./files.js")

/**
 * Retrieve the content of the ADR designated by the given ID
 * 
 * @param {number} adrID The ID of the ADR we'd like to get the content of
 * @returns {string} the raw content
 * @throws {Error} in case the given ID is invalid or isn't found for some reason; or if the file can't be read.
 * 
 */
function _contentOf(adrID)
{
    return contentOf(fullPathTo(adrID,cachedADRFiles()))
}

/**
 * Get the metadata (file name, id, title, links) for the ADR in the given path.
 * 
 * @param {string} adrPath The full path, from root, to the ADR file
 * @returns An object with keys ('id', 'filename','title','links')
 */
let adrMetadata = (adrPath) => {
    let adrBaseFilename = path.basename(adrPath)
    let indexedFile = indexedADRFile(adrBaseFilename)
    let title = filenameDef().titleFromFilename(adrBaseFilename)
    let adrContent = _contentOf(indexedFile.id)
    let  links = linksMetadata(adrContent)
    return {
        id: indexedFile.id
        , filename : indexedFile.filename
        , title : title
        , links :  links
    }
}

var adrFiles = null

function cachedADRFiles()
{
    if (adrFiles == null)
        adrFiles = allADRFiles('.')
    return adrFiles
}
module.exports = {
    adrMetadata : adrMetadata
    , contentOf : _contentOf
}
