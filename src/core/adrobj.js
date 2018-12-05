/**
 * Definition and functions for ADR logical management and querying
 *
 * @module
 */
"use strict"

let fs = require('fs-extra')
let path = require('path')
let {linksMetadata} = require("./links.js")
let {indexedADRFile, filenameDef, allADRFiles, fullPathTo, contentOf} = require("./files.js")


let adrContentFromFilename = adrFilename => fs.readFileSync(adrFilename).toString()

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
    let adrContent = contentOf(fullPathTo(indexedFile.id,cachedADRFiles())) 
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
}
