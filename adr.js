"use strict"

const program = require('commander')
const fs = require('fs-extra')

//commands

let init = (directory) => {

  let dir = directory || 'doc/adr'

  fs.ensureDir(dir)
    .then(() => { console.log("Created " + dir)})
    .catch(err => { console.err("Error: " + err)})

}



//Setting up program arguments
program
  .version('0.0.1')
  .usage("ADR Tools: Architecture Decision Records Utility")
  .command("init [directory]")
    .description("Initialize ADR in the current or given directory")
    .action(init)


program.parse(process.argv)
