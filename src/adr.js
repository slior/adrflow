"use strict"

const program = require('commander')

function loadCommand(cmd)
{
  if (cmd)
  {
    return require("./commands/" + cmd + ".js")
  }
  else throw new Error("Invalid command given" + cmd)
}

//Setting up program commands

program.version("0.1.0")

program
  .description("ADR: Architecture Decision Records Utility")
  .version('0.0.1')
  .usage("<command> args")
  .command("init [directory]")
    .description("Initialize ADR in the current or given directory")
    .action(loadCommand('init'))

program.command("new <title...>")
    .description("Create a new ADR with the given title")
    .action(loadCommand('new'))

program.command("accept <adrID>")
    .description("Accept the ADR with the given ID")
    .action(loadCommand('accept'))

program.command("list")
    .description("List all current ADRs in this project")
    .option("-b --bare","list only bare filenames")
    .action(loadCommand('list'))
  
program.command("status <adrID>")
    .description("Return the status of the ADR designated by the given ID")
    .action(loadCommand('status'))

program.command("link <source> <link> <target>")
    .description("Link source ADR to target with the given text")
    .action(loadCommand("link"))

program.command("export <id> [destinationFile]")
    .description("Export the given ADR to HTML format or to standard output if no file is given. Specify '*' as ID in order to export all")
    .action(loadCommand("export"))

program.command("content <id>")
    .description("Output the content of the ADR with the given id")
    .action(loadCommand("content"))

program.command("edit <id>")
    .description("Launch the configured editor for the given ADR")
    .action(loadCommand("edit"))

program.command("search <term>")
    .description("Search the ADRs for the given term")
    .action(loadCommand("search"))

program.command("diagram [destinationFile]")
    .description("Create and output a network diagram (HTML-based) of the current ADRs")
    .action(loadCommand("diagram"))

process.on('uncaughtException', (err) => {
  console.error(`${err}`)
});

program.parse(process.argv)

if (!program.args.length) {
   console.error('No command provided');
   program.help()
}
