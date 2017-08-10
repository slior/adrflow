

let {withADRContext,Status, EOL : NL} = require('../adr_util_sync.js')

let acceptCmd = (adrID) => {

  if (!adrID) throw new Error("No ADR ID given for accept command")
  if (isNaN(adrID)) throw new Error(`Invalid ADR ID ${adrID}`)
  withADRContext(context => {
    context.modifyADR(
            adrID
            , content => {
                let statusRE = /Status[\s]*$[\s]+[\w\- \n]+/gm //a RE that will match all the status changes
                return content.replace(statusRE,
                              (match,offset,s) => [match.trim(),"  ",Status.Accepted(),NL].join(NL))
            }
            , adrID => { console.log(`ADR ${adrID} Accepted`)}
    )
  })
}

module.exports = acceptCmd
