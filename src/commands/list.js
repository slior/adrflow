"use strict"

require('console.table')

let {withAllADRFiles, indexedADRFile} = require('./adr_util.js')

let adrTitleFromFilename = (id,f) => f.replace(`${id}-`,"")
                                      .split('_').join(' ')
                                      .replace(/\.md$/,"")

let listCmd = () => {
    withAllADRFiles(files => {
        console.table(files.map(indexedADRFile)
                            .map(x => { 
                                x.title =  adrTitleFromFilename(x.id,x.filename)
                                return x
                            }))
    })
}


module.exports = listCmd
