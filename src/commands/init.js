
/**
 * The `init` command
 * @module
 */

let fs = require('fs-extra')
let propUtil = require('properties')
let common = require('./common.js')

let defaultADRProps = {
  lastIndex : 0
}

/**
 * Given a directory, will create the directory and initialize it to be the ADR working directory.  
 * 
 * @param {string} directory The directory where to create and manage the ADRs. Optional; if not directory is given, it defaults to `doc/adr` under the current directory.
 * 
 * @see module:commands/common.adrMarkerFilename
 */
let init = (directory) => {

  let dir = directory || 'doc/adr'

  fs.ensureDir(dir)
    .then(() => {
      console.log("Created " + dir)
      //write .adr in the directory to mark it as ADR directory
      let props = propUtil.stringify(defaultADRProps)
      fs.writeFileSync(dir +"/" + common.adrMarkerFilename,props)
      console.log("Created .adr")
    })
    .catch(err => { console.err("Error: " + err)})



}


module.exports = init
