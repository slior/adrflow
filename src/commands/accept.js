
/**
 * The `accept` command 
 * @module 
 */

let { modifyADR, Status, EOL : NL} = require('./adr_util.js')

/**
 * Marks an ADR as accepted. 
 * This will update the ADR text.
 * 
 * @param {string} adrID The ID of the ADR to accept
 */
let acceptCmd = (adrID) => {

  if (!adrID) throw new Error("No ADR ID given for accept command")
  if (isNaN(adrID)) throw new Error(`Invalid ADR ID ${adrID}`)
  modifyADR(adrID,
    (content) => {
      let statusRE = /Status[\s]*$[\s]+[\w\- \n]+/gm //a RE that will match all the status changes
      return content.replace(statusRE,
                              (match,offset,s) => [match.trim(),"  ",Status.ACCEPTED(),NL].join(NL))
    },
    adrID => { console.log(`ADR ${adrID} Accepted`)}
  )

}

module.exports = acceptCmd
