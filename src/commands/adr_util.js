

let findit = require('findit2')
let common = require("./common.js")
let path = require('path')
let fs = require('fs-extra')

let adrFileRE = /^(\d+)-[\w_]+\.md$/

let findADRDir = ( callback,startFrom,notFoundHandler) => {
  let startDir = startFrom || "."
  let fsWalker = findit(startDir)
  var adrDir = ''
  let defaultNotFoundHandler = () => { throw new Error(`ADR dir not found in ${startDir}`)}
  let _notFoundHandler = notFoundHandler || defaultNotFoundHandler

  fsWalker.on('file',(file,stats,linkPath) => {
    if (path.basename(file) == common.adrMarkerFilename)
    {
        // console.log('Found: ' + file)
      adrDir = path.dirname(file)
      fsWalker.stop()
    }
  })

  fsWalker.on('stop',() => { callback(adrDir) })
  fsWalker.on('end',() => { _notFoundHandler() } )
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
    let matchingFilenames = files.filter(f => f.indexOf(adrID + "-") == 0)
    if (matchingFilenames.length < 1)
      notFoundHandler()
    else
      cb(matchingFilenames[0])
  })
}

let adrContent = (adrFilename) => {
  return fs.readFileSync(adrFilename).toString()
}

let adrFullPath = (adrDir,adrBasename) => `${adrDir}/${adrBasename}`

let modifyADR = (adrDir,adrID, cb, postModificationCB) => {
  adrFileByID(adrDir,adrID,
    (adrFilename) => {
      let fullFilename = `${adrDir}/${adrFilename}`
      let content = adrContent(fullFilename)
      fs.writeFileSync(fullFilename,cb(content))
      if (postModificationCB) postModificationCB(adrDir,adrID)
    }
  , () => { throw new Error(`ADR ${adrID} not found`)})
}

let EOL = require('os').EOL

let lastStatusOf = (adrDir,adrID, cb,notFoundHandler) => {
  adrFileByID(adrDir,adrID, adrFilename => {
    let statusRE = /Status[\s]*$[\s]+([\w\- \r\n]+)/gm
    let fullFilename = adrFullPath(adrDir,adrFilename)
    let matches = statusRE.exec(adrContent(fullFilename))
    if (matches.length < 2)
      notFoundHandler()
    else
    {
      let statuses = matches[1]
      let a = statuses.split(EOL).filter(l => l.trim() != "")
      cb(a[a.length-1].trim())
    }
  })
}

let STATUS_ACCEPTED = (d) => {
  let date = d || (new Date())
  return `Accepted ${formatDate(date)}`
}

module.exports = {
    findADRDir : findADRDir
    , withAllADRFiles : withAllADRFiles
    , adrFileRE : adrFileRE
    , adrFileByID : adrFileByID
    , modifyADR : modifyADR
    , lastStatusOf : lastStatusOf
    , Status : {
      ACCEPTED : STATUS_ACCEPTED
    }
}
