
let fs = require('fs-extra')
let findit = require('findit2')
let common = require("./common.js")
let path = require('path')
let { exec } = require('child_process')

let { create } = require('./adr_util.js')

let utils = require('../adr_util_sync.js').createUtilContext()

let adrContent = (number,title) => create(number,title)

function writeADR(adrFilename,newADR)
{
  console.info(`Writing ${adrFilename} ...`)
  fs.outputFile(adrFilename,newADR)
    .then(() => { console.info("Done.")})
    .catch((err) => { console.error(err)})
}


let nextADRNumber = () =>
{
  let currentNumbers = utils.adrFiles.map(utils.baseFilename)
                                     .map(f => {
                                        let match = common.adrFileRE.exec(f);
                                        if (!match)
                                          throw new Error(`ADR file name ${f} doesn't seem to match format`)
                                        return match[1]
                                      })
                                  .map(s => s*1)
  return currentNumbers.length > 0 ? Math.max(...currentNumbers)+1 : 1
}

let launchEditorFor = (fullFilename) =>
{
  let editorCommand = utils.config.editor
  exec(`${editorCommand} ${fullFilename}`
       ,(err,stdout,stderr) => { if (err) console.error(err) })
}

/**
 * Create a new ADR in an already initialized ADR project.  
 * This will also launch the configured editor with the new file opened in it.
 * @public @function
 * 
 * @param {string[]} titleParts - The parts of the title of the new ADR
 * 
 * @throws {Error} if the ADR file name resulting from the title parts given is invalid.
 */
let newCmd = (titleParts) => {
  let nextNum = nextADRNumber()
  let adrBasename = `${nextNum}-${titleParts.join('_')}.md`
  if (!common.adrFileRE.test(adrBasename)) throw new Error(`Resulting ADR file name is invalid: ${adrBasename}`)
  
  let title = titleParts.join(' ')
  console.info("Creating ADR " + title + " at " + utils.adrDir + " ...")
  let adrFilename = `${utils.adrDir}/${adrBasename}`
  writeADR(adrFilename,adrContent(nextNum,title))
  launchEditorFor(adrFilename)
}

module.exports = newCmd
