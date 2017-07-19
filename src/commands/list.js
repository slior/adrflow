"use strict"

require('console.table')

let {withAllADRFiles, indexedADRFile} = require('./adr_util.js')

let adrTitleFromFilename = (id,f) => f.replace(`${id}-`,"")
                                      .split('_').join(' ')
                                      .replace(/\.md$/,"")

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
