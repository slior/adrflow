"use strict"

let marked = require("marked")
let {withContentOf} = require('./adr_util.js')
let {writeFileSync} = require('fs-extra')

/**
 * Command to export a given ADR to an HTML format
 * @param {number} id - The ID of the ADR to export
 */
let exportCmd = (id,destinationFile) => {
    withContentOf(id
                , content => {
                    let html = marked(content)
                    if (destinationFile)
                    {
                        writeFileSync(destinationFile,html)
                        console.info(`ADR ${id} has been exported to ${destinationFile}`)
                    }
                    else
                        console.log(html)
                }
    )
}

module.exports = exportCmd