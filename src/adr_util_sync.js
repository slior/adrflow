"use strict"

let fs = require('fs-extra')
let walker = require('klaw-sync')
let path = require('path')
let common = require("./commands/common.js")
let propUtil = require('properties')

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

let loadConfigurationFrom = fromDir => {
    try
    {
        let sharedConfigText = fs.readFileSync(`${fromDir}/${common.adrMarkerFilename}`).toString()
        let localConfigText = fs.readFileSync(`${fromDir}/${common.localADRConfigFilename}`).toString()
        let sharedConfig = propUtil.parse(sharedConfigText)
        let localConfig = propUtil.parse(localConfigText)
        return Object.assign({},sharedConfig,localConfig)
    }
    catch (err)
    {
        console.error(err)
        return {}
    }
}

function Context()
{
    this.adrDir = resolveADRDir()
    this.adrFiles = allADRFiles(this.adrDir)
    this.contentOf = adrID => contentOf(adrID,this.adrFiles)

    this.filenameFor = adrID => path.basename(fullPathTo(adrID,this.adrFiles))
    this.baseFilename = fullFilename => path.basename(fullFilename)

    this.config = loadConfigurationFrom(this.adrDir)

    return this;
}

module.exports = {
    createUtilContext : () => { return new Context() }
}