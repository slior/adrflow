"use strict"

require('console.table')
let {contentOf} = require('../adr_util_sync.js')

let {withAllADRFiles, indexedADRFile, adrTitleFromFilename} = require('./adr_util.js')

let linksFrom = adrID => {
    let content = contentOf(adrID)
    let linksFindingRE = /((([\w_]+[\s]+[\d]+)[\s]*)*)##[\s]*Context/g
    let matches = linksFindingRE.exec(content)
    return (matches && 
            (matches.length < 2 ? [] : matches[1].split(/\r?\n/).filter(l => l.trim() !== "")))
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
