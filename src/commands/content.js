"use strict"

let {withADRContext}  = require('../adr_util_sync.js')

/**
 * Output the content of the given ID, if available.
 * @param {number} id - The ID of the ADR to output
 */
let contentCmd = (id) => withADRContext(adrContext => {
    console.info(adrContext.contentOf(id))
})

module.exports = contentCmd