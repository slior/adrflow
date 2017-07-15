
let fs = require('fs-extra')
let findit = require('findit2')
let common = require("./common.js")
let path = require('path')
let propUtil = require('properties')
let { exec } = require('child_process')
// let ADR = require('../core/adr_obj.js')

let { findADRDir, withAllADRFiles, adrFileRE, create } = require('./adr_util.js')

let adrContent = (number,title) => create(number,title).toADRString()

/**
  Given the ADR directory, search all ADRs and resolve the next available ADR number to use for a new ADR
 */
function withNextADRNumber(adrDir,callback)
{
  withAllADRFiles(adrDir,(adrFiles) => {
    let currentNumbers = adrFiles.map(f => {
                                        let match = adrFileRE.exec(f);
                                        if (!match)
                                          throw new Error(`ADR file name ${f} doesn't seem to match format`)
                                        return match[1]
                                      })
                                  .map(s => s*1)
    callback(currentNumbers.length > 0 ? Math.max(...currentNumbers)+1 : 1)
  })
}

function writeADR(adrFilename,newADR)
{
  console.info(`Writing ${adrFilename} ...`)
  fs.outputFile(adrFilename,newADR)
    .then(() => { console.info("Done.")})
    .catch((err) => { console.error(err)})
}

let launchEditorFor = (file,editorCommand) => {
  exec(`${editorCommand} ${file}`,(err,stdout,stderr) => {
    if (err)
      console.error(err)
  })
}

let withEditorCommandFrom = (adrDir,callback) => {
  propUtil.parse(`${adrDir}/${common.adrMarkerFilename}`,{ path : true}, (err,data) => {
    if (err)
      console.error(err)
    else
      callback(data.editor)
  })
}

let newCmd = (titleParts) => {
  findADRDir(
            (adrDir) => {
              withNextADRNumber(adrDir,(nextNum) => {
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
              })
            },
            ".",
            () => {
              console.error("ADR dir not found")
            })
}

module.exports = newCmd
