"use strict"

let fs = require('fs-extra')
let walker = require('klaw-sync')
let path = require('path')
let common = require("./commands/common.js")
let {indexedADRFile,adrTitleFromFilename} = require("./commands/adr_util.js")

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

let stripMDLink = textWithMDLink => {
    const LINK_TEXT = 1 //match group #1: the text of the link
    const TARGET_ID = 2 //match group #2: the ID of the target ADR
    let re = /([\w_]+)[\s]+\[?([\d])+\]?(\(.+\.md\))?/ //note: this roughly matches the RE in 'linksFor'
    let matches = re.exec(textWithMDLink)

    return  (!matches || matches.length < 3) ?
             textWithMDLink
             :
             `${matches[LINK_TEXT]} ${matches[TARGET_ID]}`
}

let linksFor = (adrID,fromFiles) => {
    let content = contentOf(adrID,fromFiles)
    let linksFindingRE = /((([\w_]+[\s]+\[?[\d]+\]?(\(.+\.md\))?)[\s]*)*)##[\s]*Context/g
    let matches = linksFindingRE.exec(content)
    return (matches && 
            (matches.length < 2 ? [] : matches[1].split(/\r?\n/)
                                                 .filter(l => l.trim() !== "")
                                                 .map(stripMDLink)))
            || []
}

let adrMetadata = (adrPath,adrFiles) => {
    let adrBaseFilename = path.basename(adrPath)
    let indexedFile = indexedADRFile(adrBaseFilename)
    let title = adrTitleFromFilename(indexedFile.id,indexedFile.filename)
    let  links = linksFor(indexedFile.id,adrFiles)
    return {
        id: indexedFile.id
        , filename : indexedFile.filename
        , title : title
        , links :  links
    }
}

function Context()
{
    this.adrDir = resolveADRDir()
    this.adrFiles = allADRFiles(this.adrDir)
    this.contentOf = adrID => {
        return contentOf(adrID,this.adrFiles)
    }
    this.linksFor = adrID => {
        return linksFor(adrID,this.adrFiles)
    }

    this.metadataFor = adrPath => adrMetadata(adrPath,this.adrFiles)

    this.filenameFor = adrID => path.basename(fullPathTo(adrID,this.adrFiles))

    return this;
}

module.exports = {
    createUtilContext : () => { return new Context() }
}