/**
 * The `status` command.
 * @module
 */

"use strict"

let {lastStatusOf} = require('./adr_util.js')

/**
 * Implements the `status` command.  
 * Given a valid ADR ID, this will output to the console the last recorded status of this ADR.
 * 
 * @param {number} adrID 
 */
let statusCmd = (adrID) => {
    if (!adrID) throw new Error("No ADR ID given for status command")
    if (isNaN(adrID)) throw new Error(`Invalid ADR ID ${adrID}`)

    lastStatusOf(adrID
                , status => { console.info(status) }
                , () => { console.error(`No status found for ADR ${adrID}`)}
    )
}


module.exports = statusCmd