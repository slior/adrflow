"use strict"

let {withADRContext} = require('../adr_util_sync.js')

let editCmd = adrID => withADRContext(adrContext => {
    adrContext.launchEditorFor(adrID)
})

module.exports = editCmd