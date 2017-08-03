"use strict"

require('console.table')

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

let enrichedADRListItem = adrData => {
  adrData.title = adrTitleFromFilename(adrData.id,adrData.filename)
  return adrData;
}

let listCmd = (options) => {
    let bare = options.bare || false
    withAllADRFiles(files => {
        if (bare)
            files.forEach(f => console.info(f))
        else 
            console.table(files.map(indexedADRFile)
                            .map(x => { 
                                x.title =  adrTitleFromFilename(x.id,x.filename)
                                return x
                            }))
    })
}


module.exports = listCmd
