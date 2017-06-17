
let fs = require('fs-extra')

let init = (directory) => {

  let dir = directory || 'doc/adr'

  fs.ensureDir(dir)
    .then(() => { console.log("Created " + dir)})
    .catch(err => { console.err("Error: " + err)})

}


module.exports = init
