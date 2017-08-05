"use strict"

require('console.table')
let fs = require('fs-extra')
let walker = require('klaw-sync')
let path = require('path')
let common = require("./common.js")

let {withContentOf, withAllADRFiles, indexedADRFile, adrTitleFromFilename} = require('./adr_util.js')

let withLinksFor = (adrID, cb) => {
  withContentOf(adrID
               , content => {
                 let linksFindingRE = /([\w_]+[\s]+[\d]+)[\s]*##[\s]*Context/g
                 let matches = linksFindingRE.exec(content)
                 if (matches.length < 2)
                    cb([])
                 else 
                 {
                   let linksText = matches[1]
                   let a = linksText.split(/\r?\n/).filter(l => l.trim() == "")
                   cb(a)
                 }
               })
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

let linksFrom = adrID => {
    let content = contentOf(adrID)
    let linksFindingRE = /((([\w_]+[\s]+[\d]+)[\s]*)*)##[\s]*Context/g
    let matches = linksFindingRE.exec(content)
    return (matches && 
            (matches.length < 2 ? [] : matches[1].split(/\r?\n/).filter(l => l.trim() != "")))
            || []
}

let enrichedADRListItem = adrData => {
  adrData.title = adrTitleFromFilename(adrData.id,adrData.filename)
  adrData.links = linksFrom(adrData.id)
  return adrData;
}

let listCmd = (options) => {
    let bare = options.bare || false
    withAllADRFiles(files => {
        if (bare)
            files.forEach(f => console.info(f))
        else 
            console.table(files.map(indexedADRFile)
                               .map(enrichedADRListItem)
                        )
    })
}


module.exports = listCmd
