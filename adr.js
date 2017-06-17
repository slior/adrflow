"use strict"

const program = require('commander')

function command(cmd)
{
  if (cmd)
    return require("./commands/" + cmd + ".js")
  else throw new Error("Invalid command given" + cmd)
}

//Setting up program commands
program
  .version('0.0.1')
  .usage("ADR Tools: Architecture Decision Records Utility")
  .command("init [directory]")
    .description("Initialize ADR in the current or given directory")
    .action(command('init'))


program.parse(process.argv)
