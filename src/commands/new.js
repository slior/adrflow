/**
 * The `new` command
 * @module
 */

let { findADRDir, withNextADRNumber, launchEditorForADR, Status } = require('./adr_util.js')
let { filenameDef : adrFileGen} = require('../core/files.js')

let adrContent = (number,title) => createADR(number,title)

/**
 * Create an ADR, with the given content.
 * 
 * @param {string} _id - The ID of the ADR
 * @param {string} _title The title of the ADR
 * @param {string} _status - What to include in the status section
 * @param {string} _context - Content for the context section.
 * @param {string} _decision - Content for the decision section.
 * @param {string} _cons - Content for the consequences section.
 * 
 * @returns {string} The new ADR content, as a markdown string.
 * 
 * @see newADRContent
 */
let createADR = (_id,_title,_status, _context,_decision,_cons) => {
  if (!_id) throw new Error("No ID given for new ADR")
  if (!_title) throw new Error("No title given for new ADR")
  let st = _status || Status.PROPOSED()
  let ctx = _context || ""
  let dec = _decision || ""
  let cons = _cons || ""

  return newADRContent(_id,_title,st,ctx,dec,cons)
}

let newADRContent = (_id,_title,_status,_context,_decision,_cons) => {
  return `# ${_id} ${_title}

## Status

${_status}

## Context
${_context}

## Decision
${_decision}

## Consequences
${_cons}

    `
}

/**
 * Create a new ADR in an already initialized ADR project.  
 * This will also launch the configured editor with the new file opened in it.
 * @public 
 * @function
 * 
 * @param {string[]} titleParts - The parts of the title of the new ADR
 * 
 * @throws {Error} if the ADR file name resulting from the title parts given is invalid.
 */
let newCmd = (titleParts) => {
  findADRDir(
            (adrDir) => {
              withNextADRNumber(nextNum => {
                let adrBasename = adrFileGen().fromIDAndName(nextNum,titleParts.join('_'))
                if (!adrFileGen().matchesDefinedTemplate(adrBasename)) throw new Error(`Resulting ADR file name is invalid: ${adrBasename}`)

                let title = titleParts.join(' ')
                console.info("Creating ADR " + title + " at " + adrDir + " ...")
                let adrFilename = `${adrDir}/${adrBasename}`
                writeADR(adrFilename,adrContent(nextNum,title))

                console.log("Launching editor for new ADR" + nextNum)
                launchEditorForADR(nextNum)

              }, adrDir)
            },
            ".",
            () => {
              console.error("ADR dir not found")
            })
}

module.exports = newCmd
