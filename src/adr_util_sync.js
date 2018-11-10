"use strict"

let fs = require('fs-extra')
let walker = require('klaw-sync')
let path = require('path')
let common = require("./commands/common.js")
let {indexedADRFile} = require("./commands/adr_util.js")
let {linksMetadata,linksFor} = require("./core/links.js")
let {fullPathTo, allADRFiles, resolveFilenameDefinition, filenameFor} = require("./core/files.js")

let resolveADRDir = startFrom => {
    let start = startFrom || '.'
    let adrMarkerFilter = file => path.basename(file.path) === common.adrMarkerFilename
    let markerFilesFound = walker(start,{filter : adrMarkerFilter, nodir : true})
    if (markerFilesFound.length < 1)
        throw new Error(`No ADR directory found from ${start}`)
    else
        return path.dirname(markerFilesFound[0].path)
}

let contentOf = (adrID,fromFiles) => {
    let adrFilename = fullPathTo(adrID,fromFiles)
    return fs.readFileSync(adrFilename).toString()
}

let adrMetadata = (adrPath,adrFiles) => {
    let adrBaseFilename = path.basename(adrPath)
    let indexedFile = indexedADRFile(adrBaseFilename)
    let title = adrTitleFromFile(indexedFile.filename)
    let  links = linksMetadata(contentOf(indexedFile.id,adrFiles))
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

    this.metadataFor = adrPath => adrMetadata(adrPath,this.adrFiles())

    this.filenameFor = adrID => filenameFor(adrID,this.adrFiles())

    return this;
}

var _resolvedFilenameDef = null

module.exports = {
    createUtilContext : () => { return new Context() }
    , adrFilename : () => {
        if (_resolvedFilenameDef === null)
            _resolvedFilenameDef = resolveFilenameDefinition((new Context()).adrDir())
        return _resolvedFilenameDef
    }
}