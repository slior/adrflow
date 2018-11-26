/**
 * Definition and functions for ADR logical management and querying
 *
 * @module
 */
"use strict"

let fs = require('fs-extra')
let path = require('path')
let {linksMetadata} = require("./links.js")
let {indexedADRFile, filenameDef} = require("./files.js")


let adrContentFromFilename = adrFilename => fs.readFileSync(adrFilename).toString()

let adrMetadata = (adrPath) => {
    let adrBaseFilename = path.basename(adrPath)
    let indexedFile = indexedADRFile(adrBaseFilename)
    let title = filenameDef().titleFromFilename(adrBaseFilename)
    let adrContent = adrContentFromFilename(adrPath) 
    let  links = linksMetadata(adrContent)
    return {
        id: indexedFile.id
        , filename : indexedFile.filename
        , title : title
        , links :  links
    }
}

module.exports = {
    adrMetadata : adrMetadata
}
