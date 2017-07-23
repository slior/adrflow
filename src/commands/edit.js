"use strict"

let {launchEditorForADR} = require('./adr_util.js')

let editCmd = id => {
    launchEditorForADR(id)
}

module.exports = editCmd