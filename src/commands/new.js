
let fs = require('fs-extra')
let findit = require('findit2')
let common = require("./common.js")
let path = require('path')
let propUtil = require('properties')
let { exec } = require('child_process')

let { findADRDir, withAllADRFiles, adrFileRE, create } = require('./adr_util.js')

let adrContent = (number,title) => create(number,title)

/**
  Given the ADR directory, search all ADRs and resolve the next available ADR number to use for a new ADR
 */
function withNextADRNumber(callback,_adrDir)
{
  withAllADRFiles(adrFiles => {
    let currentNumbers = adrFiles.map(f => {
                                        let match = adrFileRE.exec(f);
                                        if (!match)
                                          throw new Error(`ADR file name ${f} doesn't seem to match format`)
                                        return match[1]
                                      })
                                  .map(s => s*1)
    callback(currentNumbers.length > 0 ? Math.max(...currentNumbers)+1 : 1)
  }, _adrDir)
}

function writeADR(adrFilename,newADR)
{
  console.info(`Writing ${adrFilename} ...`)
  fs.outputFile(adrFilename,newADR)
    .then(() => { console.info("Done.")})
    .catch((err) => { console.error(err)})
}

/**
 * Launch the editor using the given command, with the given file name as input
 * @private @function
 * 
 * @param {string} file - The file name to open in the editor. Should be the full path.
 * @param {string} editorCommand The editor command to use.
 * @see withEditorCommandFrom
 */
let launchEditorFor = (file,editorCommand) => {
  exec(`${editorCommand} ${file}`,(err,stdout,stderr) => {
    if (err)
      console.error(err)
  })
}

/**
 * Invoke the given function with the configured editor command.
 * @private @function
 * 
 * @param {string} adrDir - The ADR directory used to find ADR files.
 * @param {function} callback - The callback that will be invoked wit the editor command.
 */
let withEditorCommandFrom = (adrDir,callback) => {
  propUtil.parse(`${adrDir}/${common.adrMarkerFilename}`,{ path : true}, (err,data) => {
    if (err)
      console.error(err)
    else
      callback(data.editor)
  })
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
  findADRDir(
            (adrDir) => {
              withNextADRNumber(nextNum => {
                let adrBasename = `${nextNum}-${titleParts.join('_')}.md`
                // console.log(`basename: ${adrBasename}`)
                if (!adrFileRE.test(adrBasename)) throw new Error(`Resulting ADR file name is invalid: ${adrBasename}`)

                let title = titleParts.join(' ')
                console.info("Creating ADR " + title + " at " + adrDir + " ...")
                let adrFilename = `${adrDir}/${adrBasename}`
                writeADR(adrFilename,adrContent(nextNum,title))

                withEditorCommandFrom(adrDir,(editor) => {
                  console.info(`Launching editor for ${adrFilename}...`)
                  launchEditorFor(adrFilename,editor)
                })
              }, adrDir)
            },
            ".",
            () => {
              console.error("ADR dir not found")
            })
}

module.exports = newCmd
