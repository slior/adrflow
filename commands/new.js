
let fs = require('fs-extra')
let findit = require('findit2')
let common = require("./common.js")
let path = require('path')
let propUtil = require('properties')

function findADRDir(startFrom, callback,notFoundHandler)
{
  let startDir = startFrom || "."
  let fsWalker = findit(startDir)
  var adrDir = ''
  fsWalker.on('file',(file,stats,linkPath) => {

    if (path.basename(file) == common.adrMarkerFilename)
    {
      // console.log('Found: ' + file)
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

let newCmd = (titleParts) => {

  findADRDir(".",
            (adrDir) => {
              let ADR_NUM = 0 //TODO: load last index from .adr, increment and save it. Use the incremented value as the number here.
              let title = titleParts.join(' ')
              console.info("Creating ADR " + title + " at " + adrDir + " ...")
              // let ADR_TITLE = title
              // let PROPOSED_DATE = getDate()
              let newADR = `# ${ADR_NUM} ${title}

## Status

Proposed: ${getDate()}

## Context

## Decision

## Consequences

              `

              let adrFilename = `${adrDir}/${ADR_NUM}-${titleParts.join('_')}.md`
              console.info(`Writing ${adrFilename} ...`)
              fs.outputFile(adrFilename,newADR)
                .then(() => { console.info("Done.")})
                .catch((err) => { console.error(err)})
            },
            () => {
              console.error("ADR dir not found")
            })
}

module.exports = newCmd
