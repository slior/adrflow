

let findit = require('findit2')
let common = require("./common.js")
let path = require('path')
let fs = require('fs-extra')
let propUtil = require('properties')
let { exec } = require('child_process')

let {templateRE : adrFileRE, titleFromFilename, idFromName} = require('../adr_util_sync.js').adrFilename

let findADRDir = ( callback,startFrom,notFoundHandler) => {
  let startDir = startFrom || "."
  let fsWalker = findit(startDir)
  var adrDir = ''
  let defaultNotFoundHandler = () => { throw new Error(`ADR dir not found in ${startDir}`)}
  let _notFoundHandler = notFoundHandler || defaultNotFoundHandler

  fsWalker.on('file',(file,stats,linkPath) => {
    if (path.basename(file) === common.adrMarkerFilename)
    {
        // console.log('Found: ' + file)
      adrDir = path.dirname(file)
      fsWalker.stop()
    }
  })

  fsWalker.on('stop',() => { callback(adrDir) })
  fsWalker.on('end',() => { _notFoundHandler() } )
}

/**
 * Given an ADR (base) file name - return an object with the same file name + the extracted ID
 * @param {string} filename - The base file name of the ADR file.
 * @returns an object with the file name (key = 'filename') and the numeric ID of the ADR (key = 'id').
 */
let adrFilenameToIndexedFilename = filename => {
  return { id : idFromName(filename), filename : filename}
}
/*
  Find all ADR file names in the given directory.
  Return an array with all the ADR file names - to the callback
*/
let withAllADRFiles = (callback, _adrDir) => {

  let body = (adrDir) => {
    let fsWalker = findit(adrDir)
    let ret = []
    fsWalker.on('file',(file,stats,linkPath) => {
      let filename = path.basename(file)
      if (adrFileRE.test(filename))
        ret.push(filename)
    })

    fsWalker.on('end',() => {
      let sortedByID = ret.map(adrFilenameToIndexedFilename)
                        .sort((x,y) => x.id - y.id)
                        .map( x => x.filename)
      callback(sortedByID)
    })
  }

  if (!_adrDir)
    findADRDir(dir => { body(dir) })
  else
    body(_adrDir)
}

let adrFileByID = (adrID, cb, notFoundHandler) => {
  withAllADRFiles(files => {
    let matchingFilenames = files.filter(f => idFromName(f) === adrID*1)
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

let withFullADRFilename = (adrID,cb) => {
  findADRDir(adrDir => {
    adrFileByID(adrID
                , adrFilename => {
                  let fullFilename = `${adrDir}/${adrFilename}`
                  cb(adrID,fullFilename)
                }
                , () => { throw new Error(`ADR ${adrID} not found`)}
    )
  })
}

let modifyADR = (adrID, cb, postModificationCB) => {
  withFullADRFilename(adrID
                      , (id,fullFilename) => {
                          let content = adrContent(fullFilename)
                          fs.writeFileSync(fullFilename,cb(content))
                          if (postModificationCB) postModificationCB(id)
                      } 
  )
}

let EOL = require('os').EOL

let lastStatusOf = (adrID, cb,notFoundHandler) => {
  findADRDir(adrDir => {
    adrFileByID(adrID, adrFilename => {
        let statusRE = /Status[\s]*$[\s]+([\w\- \r\n]+)/gm
        let fullFilename = adrFullPath(adrDir,adrFilename)
        let matches = statusRE.exec(adrContent(fullFilename))
        if (matches.length < 2)
          notFoundHandler()
        else
        {
          let statuses = matches[1]
          let a = statuses.split(/\r?\n/) //split to lines
                          .filter(l => isStatusLine(l.trim()))
          if (a.length > 0)
            cb(a[a.length-1].trim())
          else 
            throw new Error(`Invalid status section for ADR ${adrID}`)
        }
      },notFoundHandler)
  })
  
}

let isStatusLine = line => line.search(/^(Accepted|Proposed)/g) >= 0 //note: this regexp should match the status texts given below

function statusMsgGenerator(text)
{
  return d => {
    let date = d || (new Date())
    return `${text} ${formatDate(date)}`  
  }
}

let acceptedStatusText = "Accepted"
let STATUS_ACCEPTED = statusMsgGenerator(acceptedStatusText)

let proposedStatusText = "Proposed"
let STATUS_PROPOSED = statusMsgGenerator(proposedStatusText)

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

/**
 * Given an ADR ID and a mapping function, return the invocation of the function on the content of that ADR
 * @param {number} adrID - The ID of the ADR whose content we wish to map
 * @param {string => *} cb - A callback function receiving the content of the given ADR
 */
let withContentOf = (adrID,cb) => {
  withFullADRFilename(adrID
                      , (id,fullFilename) => {
                          cb(adrContent(fullFilename))
                      }
  )
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

  let callbackWithEditorIfPresent = config => {
    if (!config.editor)
       throw new Error("no configured editor command")
    else
      callback(config.editor)
  }

  let exists = file => fs.existsSync(file)

  let tryToOverrideWithLocalConfigAndCallback = (localFilename, sharedConfig) => 
        propUtil.parse(localConfigFilename, {path : true}, (err2,localConfig) => {
          if (err2) //some error while parsing the local configuration - don't continue
            console.error(err2)
          else
            callbackWithEditorIfPresent(Object.assign({},sharedConfig,localConfig)) //local overrides shared data
        })

        
  propUtil.parse(`${adrDir}/${common.adrMarkerFilename}`,{ path : true}, (err,sharedConfig) => {
    if (err)
      console.error(err)
    else
    {
      let localConfigFilename = `${adrDir}/${common.localADRConfigFilename}`
      if (exists(localConfigFilename))
        tryToOverrideWithLocalConfigAndCallback(localConfigFilename,sharedConfig)
      else 
        callbackWithEditorIfPresent(sharedConfig) //no local override of configuration => fallback to shared configuration
    }
  })
}

/**
 * Find the configured editor command, and invoke the given callback on it
 * @private @function
 * 
 * @param {function} callback - the callback that will be invoked on the editor command (a string)
 * @see withEditorCommandFrom
 */
let withEditorCommand = callback => {
  findADRDir(adrDir => {
              withEditorCommandFrom(adrDir, editor => { callback(editor) })
            }
            , '.'
            , () => { throw new Error("ADR directory not found")}
  )
}

/**
 * Given an ADR ID, this will launch the configured editor for that ID
 * 
 * @param {number} adrID - The ID of the ADR to find and load into the editor
 * @see launchEditorFor
 * @see withEditorCommand
 */
let launchEditorForADR = adrID => {
  withFullADRFilename(adrID
                      , (id, fullFilename) => {
                        withEditorCommand(cmd => {
                          console.info(`Launching editor for ADR ${adrID}`)
                          launchEditorFor(fullFilename,cmd)
                        })
                      }
  )
}

let adrTitleFromFilename = (id,f) => titleFromFilename(f)

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
    , indexedADRFile : adrFilenameToIndexedFilename
    , EOL : EOL
    , withContentOf : withContentOf
    , withFullADRFilename : withFullADRFilename
    , launchEditorForADR : launchEditorForADR
    , adrTitleFromFilename : adrTitleFromFilename
    , adrContent : adrContent
}
