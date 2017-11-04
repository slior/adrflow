"use strict"

let fs = require('fs-extra')

let writeTextFileAndNotifyUser = (filename,content,infoLine) => {
  console.info(infoLine)
  fs.outputFile(filename,content)
    .then(() => { console.info("Done.")})
    .catch((err) => { console.error(err)})
}

module.exports = {
  adrMarkerFilename : ".adr"
  , localADRConfigFilename : "local.adr"
  , writeTextFileAndNotifyUser : writeTextFileAndNotifyUser
}
