"use strict"

require('console.table')
let utils = require('../adr_util_sync.js').createUtilContext()

let {withAllADRFiles, indexedADRFile, adrTitleFromFilename} = require('./adr_util.js')

let stripMDLink = textWithMDLink => {
    const LINK_TEXT = 1 //match group #1: the text of the link
    const TARGET_ID = 2 //match group #2: the ID of the target ADR
    let re = /([\w_]+)[\s]+\[?([\d])+\]?(\(.+\.md\))?/ //note: this roughly matches the RE in 'linksFrom'
    let matches = re.exec(textWithMDLink)

    return  (!matches || matches.length < 3) ?
             textWithMDLink
             :
             `${matches[LINK_TEXT]} ${matches[TARGET_ID]}`
}

let linksFrom = adrID => {
    let content = utils.contentOf(adrID)
    let linksFindingRE = /((([\w_]+[\s]+\[?[\d]+\]?(\(.+\.md\))?)[\s]*)*)##[\s]*Context/g
    let matches = linksFindingRE.exec(content)
    return (matches && 
            (matches.length < 2 ? [] : matches[1].split(/\r?\n/)
                                                 .filter(l => l.trim() !== "")
                                                 .map(stripMDLink)))
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
