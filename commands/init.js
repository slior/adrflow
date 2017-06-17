
let fs = require('fs-extra')
let propUtil = require('properties')

let defaultADRProps = {
  lastIndex : 0
}

let init = (directory) => {

  let dir = directory || 'doc/adr'

  fs.ensureDir(dir)
    .then(() => {
      console.log("Created " + dir)
      //write .adr in the directory to mark it as ADR directory
      let props = propUtil.stringify(defaultADRProps)
      fs.writeFileSync(dir +"/.adr",props)
      console.log("Created .adr")
    })
    .catch(err => { console.err("Error: " + err)})



}


module.exports = init
