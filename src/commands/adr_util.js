

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
let withAllADRFiles = (callback) => {
  findADRDir(adrDir => {
    let fsWalker = findit(adrDir)
    let ret = []
    fsWalker.on('file',(file,stats,linkPath) => {
      let filename = path.basename(file)
      if (adrFileRE.test(filename))
        ret.push(filename)
    })

    fsWalker.on('end',() => {callback(ret)})
  })
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

let modifyADR = (adrID, cb, postModificationCB) => {
  findADRDir(adrDir => {
    adrFileByID(adrDir,adrID,
        (adrFilename) => {
          let fullFilename = `${adrDir}/${adrFilename}`
          let content = adrContent(fullFilename)
          fs.writeFileSync(fullFilename,cb(content))
          if (postModificationCB) postModificationCB(adrID)
        }
      , () => { throw new Error(`ADR ${adrID} not found`)})
  })
  
}

let EOL = require('os').EOL

let lastStatusOf = (adrID, cb,notFoundHandler) => {
  findADRDir(adrDir => {
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
  })
  
}

let STATUS_ACCEPTED = (d) => {
  let date = d || (new Date())
  return `Accepted ${formatDate(date)}`
}

let STATUS_PROPOSED = (d) => {
  let dt = d || (new Date())
  return `Proposed ${formatDate(dt)}`
}


let createADR = (_id,_title,_status, _context,_decision,_cons) => {
  if (!_id) throw new Error("No ID given for new ADR")
  if (!_title) throw new Error("No title given for new ADR")
  let st = _status || STATUS_PROPOSED()
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

function formatDate(date) {
    if (!date) throw new Error("Invalid date to format")

    let year = date.getFullYear();
    var month = date.getMonth() + 1;
    month = (month < 10 ? "0" : "") + month;
    var day  = date.getDate();
    day = (day < 10 ? "0" : "") + day;
    return year + "-" + month + "-" + day;
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
    , create : createADR
}
