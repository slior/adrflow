

let {findADRDir, adrFileByID, modifyADR} = require('./adr_util.js')
let ADR = require('../core/adr_obj.js')
const NL = "\n"

let acceptCmd = (adrID) => {

  if (!adrID) throw new Error("No ADR ID given for accept command")
  if (isNaN(adrID)) throw new Error(`Invalid ADR ID ${adrID}`)
  findADRDir(".",
    (adrDir) => {
      modifyADR(adrDir,adrID,
        (content) => {
          let statusRE = /Status[\s]*$[\s]+[\w\- \n]+/gm //a RE that will match all the status changes
          return content.replace(statusRE,
                                 (match,offset,s) => [match.trim(),ADR.Status.ACCEPTED(),NL].join(NL))
        },
        (adrDir,adrID) => { console.log(`ADR ${adrID} Accepted`)}
      )
  },
    () => { throw new Error(`ADR directory not found`)})

}

module.exports = acceptCmd
