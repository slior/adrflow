"use strict"

require('console.table')
let utils = require('../adr_util_sync.js').createUtilContext()

let {withAllADRFiles, indexedADRFile, adrTitleFromFilename} = require('./adr_util.js')

let stripMDLink = textWithMDLink => {
    let re = /([\w_]+)[\s]+\[?([\d])+\]?(\(.+\.md\))?/ //note: this roughly matches the RE in 'linksFrom'
    let matches = re.exec(textWithMDLink)
    if (!matches || matches.length < 3) 
        return textWithMDLink
    else 
    {
        let targetID = matches[2]
        let linkText = matches[1]
        return `${linkText} ${targetID}`
    }
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
