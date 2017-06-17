
let fs = require('fs-extra')
let findit = require('findit2')
let common = require("./common.js")
let path = require('path')

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

let newCmd = (title) => {

  findADRDir(".",
            (adrDir) => {
              // console.log("Found adr dir at " + adrDir)
              console.info("Creating ADR " + title + " ...")
              //TODO: create the ADR directory from a template
            },
            () => {
              console.error("ADR dir not found")
            })
}

module.exports = newCmd
