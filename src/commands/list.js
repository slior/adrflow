"use strict"

require('console.table')
let utils = require('../adr_util_sync.js').createUtilContext()

let {withAllADRFiles, indexedADRFile, adrTitleFromFilename} = require('./adr_util.js')

let linksFrom = adrID => utils.linksFor(adrID)

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
