/**
 * The `status` command.
 * @module
 */

"use strict"

let {findADRDir, adrFileByID, adrContent} = require('./adr_util.js')

let adrFullPath = (adrDir,adrBasename) => `${adrDir}/${adrBasename}`

let isStatusLine = line => line.search(/^(Accepted|Proposed)/g) >= 0 //note: this regexp should match the status texts given in adr_util.Status

function extractLastStatusFromStatusRegExpMatchAndCallback(matches,callback) {
    let statuses = matches[1]
    let a = statuses.split(/\r?\n/) //split to lines
                    .filter(l => isStatusLine(l.trim()))
    if (a.length > 0)
      callback(a[a.length-1].trim())
    else 
      throw new Error(`Invalid status section for ADR ${adrID}`)
  }

function extractStatusOrSignalNotFound(matches, notFoundHandler, cb) {
    if (matches.length < 2) //1st matching group is the statuses. See regexp in lastStatusOf
        notFoundHandler();
    else
        extractLastStatusFromStatusRegExpMatchAndCallback(matches, cb);
}

let lastStatusOf = (adrID, cb,notFoundHandler) => {
    findADRDir(adrDir => {
        adrFileByID(adrID, adrFilename => {
            let statusRE = /Status[\s]*$[\s]+([\w\- \r\n]+)/gm
            let fullFilename = adrFullPath(adrDir,adrFilename)
            let matches = statusRE.exec(adrContent(fullFilename))
            extractStatusOrSignalNotFound(matches, notFoundHandler, cb);
        },notFoundHandler)
    })

}

let defaultStatusCallback = status => { console.info(status) }

/**
 * Implements the `status` command.  
 * Given a valid ADR ID, this will output to the console the last recorded status of this ADR.
 * 
 * @param {number} adrID The ID of the ADR examined
 * @param {function} statusCallback The function that will be called with the last status text
 */
let statusCmd = (adrID,statusCallback) => {
    if (!adrID) throw new Error("No ADR ID given for status command")
    if (isNaN(adrID)) throw new Error(`Invalid ADR ID ${adrID}`)
    let cb = statusCallback || defaultStatusCallback

    lastStatusOf(adrID
                , cb
                , () => { console.error(`No status found for ADR ${adrID}`)}
    )
}


module.exports = statusCmd