/**
 * The `edit` command
 * @module
 */
"use strict"

let {launchEditorForADR} = require('./adr_util.js')

/**
 * Given an ADR ID, launch the configured editor with the ADR loaded.  
 * The editor is configured in the adr marker file/local configuration file.
 * @param {string} id 
 * @see module:commands/common.localADRConfigFilename
 */
let editCmd = id => {
    launchEditorForADR(id)
}

module.exports = editCmd