"use strict"

const program = require('commander')

function loadCommand(cmd)
{
  if (cmd)
    return require("./commands/" + cmd + ".js")
  else throw new Error("Invalid command given" + cmd)
}

//Setting up program commands
program
  .description("ADR: Architecture Decision Records Utility")
  .version('0.0.1')
  .usage("<command> args")
  .command("init [directory]")
    .description("Initialize ADR in the current or given directory")
    .action(loadCommand('init'))


program.parse(process.argv)

if (typeof cmdValue === 'undefined') {
   console.error('No command provided');
   program.help()
}
