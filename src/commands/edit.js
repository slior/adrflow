"use strict"

let adrContext = require('../adr_util_sync.js').createUtilContext()

let editCmd = adrID => {
    adrContext.launchEditorFor(adrID)
}

module.exports = editCmd