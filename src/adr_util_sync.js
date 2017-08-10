"use strict"

let fs = require('fs-extra')
let walker = require('klaw-sync')
let path = require('path')
let common = require("./commands/common.js")
let propUtil = require('properties')
let { exec } = require('child_process')

function time(title,block)
{
    console.time(title)
    let ret = block()
    console.timeEnd(title)
    return ret
}

let resolveADRDir = startFrom => {
    // return time("ADR DIR", () => {
        let start = startFrom || '.'
        let adrMarkerFilter = file => path.basename(file.path) === common.adrMarkerFilename
        let markerFilesFound = walker(start,{filter : adrMarkerFilter, nodir : true})
        if (markerFilesFound.length < 1)
            throw new Error(`No ADR directory found from ${start}`)
        else
            return path.dirname(markerFilesFound[0].path)
    // })
}

let adrFileRE = /^(\d+)[- ][\w_ -]+\.md$/

let allADRFiles = (_adrDir) => {
    // return time("ALL FILES", () => {
        let adrDir = _adrDir || resolveADRDir()
        let adrFilter = file => adrFileRE.test(path.basename(file.path))
        return walker(adrDir, {filter : adrFilter}).map(f => f.path)
    // })
}

let fullPathTo = (adrID,_adrFiles) => {
    let adrFiles = _adrFiles || allADRFiles()
    let matchingFilenames = adrFiles.filter(f => path.basename(f).indexOf(adrID + "-") === 0)
    if (matchingFilenames.length < 1) //not found
        throw new Error(`Could not find ADR file for ADR ${adrID}`)
    else
        return matchingFilenames[0]
}

let _contentOf = (adrID,fromFiles) => {
    let adrFilename = fullPathTo(adrID,fromFiles)
    return fs.readFileSync(adrFilename).toString()
}

let loadConfigurationFrom = fromDir => {
    try
    {
        // return time("LOAD CONFIG",() => {

            let sharedConfigText = fs.readFileSync(`${fromDir}/${common.adrMarkerFilename}`).toString()
            let sharedConfig = propUtil.parse(sharedConfigText)

            let localConfigFilename = `${fromDir}/${common.localADRConfigFilename}`
            let hasLocalConfiguration = fs.existsSync(localConfigFilename)
            let localConfig = hasLocalConfiguration ? 
                                propUtil.parse(fs.readFileSync(localConfigFilename).toString())
                                : {}
            return Object.assign({},sharedConfig,localConfig)
        // })
    }
    catch (err)
    {
        console.error(err)
        return {}
    }
}

class ADRContext
{
    constructor() 
    {
        this.adrDir = resolveADRDir()
        this.adrFiles = allADRFiles(this.adrDir)
        this.config = loadConfigurationFrom(this.adrDir)
    }
    
    contentOf(adrID)
    {
        return _contentOf(adrID,this.adrFiles)
    } 

    filenameFor(adrID) 
    {
        return path.basename(fullPathTo(adrID,this.adrFiles))
    }

    baseFilename(fullFilename) 
    {
        return path.basename(fullFilename)
    }

    modifyADR(adrID, contentModifier, postModificationCB)
    {
        let fullFilename = fullPathTo(adrID,this.adrFiles)
        fs.writeFileSync(fullFilename
                         ,contentModifier(this.contentOf(adrID)))
        if (postModificationCB)
            postModificationCB(adrID)
    }

    launchEditorFor(adrID)
    {
        this.launchEditorForFile(fullPathTo(adrID,this.adrFiles))
    }

    launchEditorForFile(fullFilename)
    {
        exec(`${this.config.editor} ${fullFilename}`
             , (err,stdout,stderr) => { if (err) console.error(err) })
    }
}

function formatDate(date) {
    if (!date) throw new Error("Invalid date to format")

    let year = date.getFullYear();
    var month = date.getMonth() + 1;
    month = (month < 10 ? "0" : "") + month;
    var day  = date.getDate();
    day = (day < 10 ? "0" : "") + day;
    return year + "-" + month + "-" + day;
}

function statusMsgGenerator(text)
{
  return d => {
    let date = d || (new Date())
    return `${text} ${formatDate(date)}`  
  }
}

let acceptedStatusText = "Accepted"
let STATUS_ACCEPTED = statusMsgGenerator(acceptedStatusText)

let proposedStatusText = "Proposed"
let STATUS_PROPOSED = statusMsgGenerator(proposedStatusText)

let withADRContext = block => {
    let ctxt = new ADRContext()
    return block(ctxt)
}

module.exports = {
    createUtilContext : () => { return new ADRContext() }
    , ADRContext : ADRContext
    , Status : {
        Proposed : STATUS_PROPOSED
        , Accepted : STATUS_ACCEPTED
    }
    , EOL : require('os').EOL
    , withADRContext : withADRContext
}