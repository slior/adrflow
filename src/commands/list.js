"use strict"

require('console.table')

let {withADRContext} = require('../adr_util_sync.js')

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

let linksFindingRE = /((([\w_]+[\s]+\[?[\d]+\]?(\(.+\.md\))?)[\s]*)*)##[\s]*Context/g

let linksFrom = (adrID,context) => {
    let content = context.contentOf(adrID)
    let matches = linksFindingRE.exec(content)
    return (matches && 
            (matches.length < 2 ? [] : matches[1].split(/\r?\n/)
                                                 .filter(l => l.trim() !== "")
                                                 .map(stripMDLink)))
            || []
}

let enrichedADRListItem = (adrData,context) => {
  adrData.title = adrTitleFromFilename(adrData.id,adrData.filename)
  adrData.links = linksFrom(adrData.id,context)
  return adrData;
}

let listCmd = (options) => withADRContext(context => {
    let bare = options.bare || false
    withAllADRFiles(files => {
        if (bare)
            files.forEach(f => console.info(f))
        else 
            console.table(files.map(indexedADRFile)
                               .map(adrData => enrichedADRListItem(adrData,context))
                        )
    })
})


module.exports = listCmd
