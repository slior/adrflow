

let {findADRDir, adrFileByID} = require('./adr_util.js')

let acceptCmd = (adrID) => {

  if (!adrID) throw new Error("No ADR ID given for accept command")
  if (isNaN(adrID)) throw new Error(`Invalid ADR ID ${adrID}`)
  findADRDir(".",
    (adrDir) => {
      adrFileByID(adrDir,adrID, (adrFilename) => {
        console.log(adrFilename)
        //TODO: implement the actual command logic
      },
      () => { throw new Error(`ADR ${adrID} not found`)}
    )},
    () => { throw new Error(`ADR directory not found`)})

}

module.exports = acceptCmd
