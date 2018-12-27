/**
 * The `reassign` command
 * @module
 */

"use strict"
let {withNextADRNumber} = require('./adr_util.js')
let {filenameDef,filenameFor, resolveADRDir, writeADR} = require('../core/files.js')
let {contentOf} = require('../core/adrobj.js')
let fs = require('fs-extra')
let path = require('path')

const idMatcher = /^# \d+/
let reassignCmd = oldID => {
    withNextADRNumber(newID => {
        // 1. read content from existing ADR
        let content = contentOf(oldID)
        let newContent = content.replace(idMatcher,(_,__,___) => `# ${newID}`) //replace ID in the header. Has to be synched with the template in 'new' command.
        // 2. Assuming content is read, write content to file with new name, using the new ADR
        let oldFilename = filenameFor(oldID)
        let oldBaseFilename = path.basename(oldFilename)
        let title = filenameDef().titleFromFilename(oldBaseFilename)
        let newBaseFilename = filenameDef().fromIDAndName(newID,title) //has to be synched with the title->filename functionality as in the 'new' command.
        let newFilename = `${resolveADRDir()}/${newBaseFilename}` //construction of full file name has to be synched with the 'new' command
        
        
        console.info(`Writing ADR ${newID} (used to be ${oldID}) to ${newFilename} ...`)
        writeADR(newFilename,newContent)
        
        //3. delete the old file
        console.info(`Deleting ${oldFilename}...`)
        fs.unlinkSync(oldFilename)

        console.info("Done.")

    })
}

module.exports = reassignCmd