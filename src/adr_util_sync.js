"use strict"

let fs = require('fs-extra')
let walker = require('klaw-sync')
let path = require('path')
let common = require("./commands/common.js")

let resolveADRDir = startFrom => {
    let start = startFrom || '.'
    let adrMarkerFilter = file => path.basename(file.path) === common.adrMarkerFilename
    let markerFilesFound = walker(start,{filter : adrMarkerFilter, nodir : true})
    if (markerFilesFound.length < 1)
        throw new Error(`No ADR directory found from ${start}`)
    else
        return path.dirname(markerFilesFound[0].path)
}

let allADRFiles = (_adrDir) => {
    let adrDir = _adrDir || resolveADRDir()
    let adrFileRE = /^(\d+)[- ][\w_ -]+\.md$/
    let adrFilter = file => adrFileRE.test(path.basename(file.path))
    return walker(adrDir, {filter : adrFilter}).map(f => f.path)
}

let fullPathTo = (adrID,_adrFiles) => {
    let adrFiles = _adrFiles || allADRFiles()
    let matchingFilenames = adrFiles.filter(f => path.basename(f).indexOf(adrID + "-") === 0)
    if (matchingFilenames.length < 1) //not found
        throw new Error(`Could not find ADR file for ADR ${adrID}`)
    else
        return matchingFilenames[0]
}

let contentOf = (adrID,fromFiles) => {
    let adrFilename = fullPathTo(adrID,fromFiles)
    return fs.readFileSync(adrFilename).toString()
}

function Context()
{
    this.adrID = resolveADRDir()
    this.adrFiles = allADRFiles(this.adrID)
    this.contentOf = adrID => {
        return contentOf(adrID,this.adrFiles)
    }
    return this;
}

module.exports = {
    createUtilContext : () => { return new Context() }
}