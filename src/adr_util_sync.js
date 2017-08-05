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

let allADRFiles = () => {
    let adrDir = resolveADRDir()
    let adrFileRE = /^(\d+)[- ][\w_ -]+\.md$/
    let adrFilter = file => adrFileRE.test(path.basename(file.path))
    return walker(adrDir, {filter : adrFilter}).map(f => f.path)
}

let fullPathTo = adrID => {
    let adrFiles = allADRFiles() //TODO: this enumerates all files every time, can probably use caching/memoization.
    let matchingFilenames = adrFiles.filter(f => path.basename(f).indexOf(adrID + "-") === 0)
    if (matchingFilenames.length < 1) //not found
        throw new Error(`Could not find ADR file for ADR ${adrID}`)
    else
        return matchingFilenames[0]
}

let contentOf = adrID => {
    let adrFilename = fullPathTo(adrID)
    return fs.readFileSync(adrFilename).toString()
}

module.exports = {
    contentOf : contentOf

}