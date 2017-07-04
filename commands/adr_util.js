

let findit = require('findit2')
let common = require("./common.js")
let path = require('path')

let adrFileRE = /^(\d+)-[\w_]+\.md$/

let findADRDir = (startFrom, callback,notFoundHandler) => {
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

let adrFileByID = (adrDir,adrID, cb, notFoundHandler) => {
  withAllADRFiles(adrDir,(files) => {
    // console.log(files)
    // console.log(`searching for id ${adrID}`)
    let matchingFilenames = files.filter(f => f.indexOf(adrID + "-") == 0)
    console.dir()
    if (matchingFilenames.length < 1)
      notFoundHandler()
    else
      cb(matchingFilenames[0])
  })
}


module.exports = {
    findADRDir : findADRDir
    , withAllADRFiles : withAllADRFiles
    , adrFileRE : adrFileRE
    , adrFileByID : adrFileByID
}
