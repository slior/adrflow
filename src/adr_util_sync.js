"use strict"

let fs = require('fs-extra')
let {linksFor} = require("./core/links.js")
let {fullPathTo, allADRFiles, resolveADRDir} = require("./core/files.js")

let contentOf = (adrID,fromFiles) => {
    let adrFilename = fullPathTo(adrID,fromFiles)
    return adrContentFromFilename(adrFilename)
}

let adrContentFromFilename = adrFilename => fs.readFileSync(adrFilename).toString()


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

    return this;
}

module.exports = {
    createUtilContext : () => { return new Context() }
}