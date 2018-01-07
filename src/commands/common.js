/** @module Common */

"use strict"

let fs = require('fs-extra')

/**
 * Write the given content to the given file name.
 * Will output, in the console, the given message when successful.
 * Will output an error if one occures (on standard error, in the console.)
 * @param {string} filename The file name to write to.
 * @param {string} content  The content to write
 * @param {string} infoLine The message to give to the user when finished successfully.
 */
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
