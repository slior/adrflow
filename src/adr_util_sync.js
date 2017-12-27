"use strict"

let fs = require('fs-extra')
let walker = require('klaw-sync')
let path = require('path')
let common = require("./commands/common.js")
let {indexedADRFile} = require("./commands/adr_util.js")

let adrFileRE = /^(\d+)[- ]([\w_ -]+)\.md$/

let adrIDFromFilename = filename => {
    let a = adrFileRE.exec(filename)
    if (!a) throw new Error(`${filename} doesn't match an ADR file pattern`)
    return a[1]*1
}

let adrTitleFromFile = filename => {
    let a = adrFileRE.exec(filename)
    if (!a) throw new Error(`${filename} doesn't match an ADR file pattern`)
    return a[2].split('_').join(' ')
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

let allADRFiles = (_adrDir) => {
    let adrDir = _adrDir || resolveADRDir()
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

let statusSectionFrom = adrContent => {
    let lines = adrContent.split(/\r?\n/).map(l => l.trim())
    let statusTitleRE = /^##\s*[Ss]tatus/
    let contentTitleRE = /^##\s*[Cc]ontext/
    let statusStartInd = lines.findIndex(line => statusTitleRE.test(line))
    let statusEndInd = lines.findIndex(line => contentTitleRE.test(line))
    //TODO: handle error conditions - negative indices
    return lines.slice(statusStartInd+1,statusEndInd)
}

let linkTextFrom = adrLink => {
    let labelFindingRE = /\[?(\w+\s+\d+)\]?(\(.+\.md\))?/
    let matches = labelFindingRE.exec(adrLink)
    return matches && matches.length >= 2 ? matches[1] : ""
} 

let linksFor = (adrID,fromFiles) => {
    return linksMetadata(adrID,fromFiles)
            .map(linkMD => `${linkMD.text} ${linkMD.target}`)
            .filter(t => t !== "")
}

let parseSimpleLinkText = linkText =>  genericLinkParsing(linkText,/(.*)\s+([\d]+).*/,lt => {
                                                console.warn(`Failed to parse target link for ${lt}`)
                                                return {}
                                            })


const linkRE = /([\w_]+)[\s]+\[?([\d])+\]?(\(.+\.md\))?/
let toTargetIDAndText = (linkText) => genericLinkParsing(linkText,linkRE, lt => parseSimpleLinkText(lt))

let genericLinkParsing = (linkText,re,errHandler) => {
    const LINK_TEXT = 1 //match group #1: the text of the link
    const TARGET_ID = 2 //match group #2: the ID of the target ADR
    let matches = re.exec(linkText)
    if (!matches || matches.length < 3)
        return errHandler(linkText)
    else return { text : matches[LINK_TEXT], target : matches[TARGET_ID]}
}

let linksMetadata = (adrID,fromFiles) => {
    let statusUpdateRE = /\w+\s+\d{4}-\d{1,2}-\d{1,2}/ //Essentially: "word 2017-11-3" or similar
    //get all the status section content, filter out everything that's not a link, then parse and return it
    return statusSectionFrom(contentOf(adrID,fromFiles))
            .filter(line => line !== "")
            .filter(line => !statusUpdateRE.test(line)) //need to filter this separately, as the beginning of a status update looks like a link text with no markdown link, which is legal.
            .filter(line => linkRE.test(line))
            .map(toTargetIDAndText)
}

let adrMetadata = (adrPath,adrFiles) => {
    let adrBaseFilename = path.basename(adrPath)
    let indexedFile = indexedADRFile(adrBaseFilename)
    let title = adrTitleFromFile(indexedFile.filename)
    let  links = linksMetadata(indexedFile.id,adrFiles)
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
        return linksFor(adrID,this.adrFiles())
    }

    this.metadataFor = adrPath => adrMetadata(adrPath,this.adrFiles())

    this.filenameFor = adrID => path.basename(fullPathTo(adrID,this.adrFiles()))

    return this;
}

module.exports = {
    createUtilContext : () => { return new Context() }
    , adrFilename : {
        matchesDefinedTemplate : name => adrFileRE.test(name)
        , fromIDAndName : (id,name) => `${id}-${name}.md`
        , titleFromFilename : adrTitleFromFile
        , idFromName : adrIDFromFilename
    }
}