"use strict"

let adrContext = require('../adr_util_sync.js').createUtilContext()

/**
 * Output the content of the given ID, if available.
 * @param {number} id - The ID of the ADR to output
 */
let contentCmd = (id) => { console.info(adrContext.contentOf(id)) }

module.exports = contentCmd