
let fs = require('fs-extra')
let findit = require('findit2')
let common = require("./common.js")
let path = require('path')
let propUtil = require('properties')

let adrFileRE = /^(\d+)-[\w_]+\.md$/

let findADRDir = (startFrom, callback,notFoundHandler) => {
  let startDir = startFrom || "."
  let fsWalker = findit(startDir)
  var adrDir = ''

  fsWalker.on('file',(file,stats,linkPath) => {
    if (path.basename(file) == common.adrMarkerFilename)
    {
      //  console.log('Found: ' + file)
      adrDir = path.dirname(file)
      fsWalker.stop()
    }
  })

  fsWalker.on('stop',() => { callback(adrDir) })
  fsWalker.on('end',() => { notFoundHandler() } )
}


function getDate() {

    let date = new Date();
    let year = date.getFullYear();
    var month = date.getMonth() + 1;
    month = (month < 10 ? "0" : "") + month;
    var day  = date.getDate();
    day = (day < 10 ? "0" : "") + day;
    return year + "-" + month + "-" + day;
}

/*
  Find all ADR file names in the given directory.
  Return an array with all the ADR file names - to the callback
*/
let withAllADRFiles = (adrDir, callback) => {
  let fsWalker = findit(adrDir)
  let ret = []
  fsWalker.on('file',(file,stats,linkPath) => {
    let filename = path.basename(file)
    if (adrFileRE.test(filename))
      ret.push(filename)
  })

  fsWalker.on('end',() => {callback(ret)})
}

let adrContent = (number,title,date) => {
  return `# ${number} ${title}

## Status

Proposed: ${date}

## Context

## Decision

## Consequences

  `
}

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

let newCmd = (titleParts) => {
  findADRDir(".",
            (adrDir) => {
              withNextADRNumber(adrDir,(nextNum) => {
                let adrBasename = `${nextNum}-${titleParts.join('_')}.md`
                // console.log(`basename: ${adrBasename}`)
                if (!adrFileRE.test(adrBasename)) throw new Error(`Resulting ADR file name is invalid: ${adrBasename}`)

                let title = titleParts.join(' ')
                console.info("Creating ADR " + title + " at " + adrDir + " ...")
                writeADR(`${adrDir}/${adrBasename}`,adrContent(nextNum,title,getDate()))
              })
            },
            () => {
              console.error("ADR dir not found")
            })
}

module.exports = newCmd
