"use strict"

let fs = require('fs-extra')
let path = require('path')
let {linksMetadata,linksFor} = require("./core/links.js")
let {fullPathTo, allADRFiles, filenameFor, resolveADRDir, indexedADRFile, filenameDef} = require("./core/files.js")

let contentOf = (adrID,fromFiles) => {
    let adrFilename = fullPathTo(adrID,fromFiles)
    return adrContentFromFilename(adrFilename)
}

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

function Context()
{
    this._adrDir = null
    this.adrDir = () => {
        if (this._adrDir == null)
            this._adrDir = resolveADRDir()
        return this._adrDir
    }
    
    this._adrFiles = null
    this.adrFiles = () => {
        if (this._adrFiles == null)
            this._adrFiles = allADRFiles(this.adrDir())
        return this._adrFiles
    }

    this.contentOf = adrID => {
        return contentOf(adrID,this.adrFiles())
    }
    this.linksFor = adrID => {
        return linksFor(contentOf(adrID,this.adrFiles()))
    }

    this.filenameFor = adrID => filenameFor(adrID,this.adrFiles())

    return this;
}

module.exports = {
    createUtilContext : () => { return new Context() }
    , adrMetadata : adrMetadata
}