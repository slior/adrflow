"use strict"

const program = require('commander')

function executeSingleParamCommand(cmd,param)
{
    let c = require('./commands/' + cmd + ".js")
    c(param)
}

function extractVersion()
{
    let fs = require('fs')
    let json = JSON.parse(fs.readFileSync('package.json', 'utf8'))
    return json.version
}

//Setting up program commands

program
  .description("ADR: Architecture Decision Records Utility")
  .version(extractVersion())
  .usage("<command> args")
  .command("init [directory]")
    .description("Initialize ADR in the current or given directory")
    .action(_ => executeSingleParamCommand('init',_))

program.command("new <title...>")
    .description("Create a new ADR with the given title")
    .action(titleParts => {
        let cmd = require('./commands/new.js')
        cmd(titleParts)
    })

program.command("accept <adrID>")
    .description("Accept the ADR with the given ID")
    .action(_ => executeSingleParamCommand('accept',_))

program.command("list")
    .description("List all current ADRs in this project")
    .option("-b --bare","list only bare filenames")
    .action(function(options) {
        let cmd = require('./commands/list.js')
        cmd(options)
    })
  
program.command("status <adrID>")
    .description("Return the status of the ADR designated by the given ID")
    .action(_ => executeSingleParamCommand('status',_))

program.command("link <source> <link> <target>")
    .description("Link source ADR to target with the given text")
    .action((s,l,t) => {
        let cmd = require('./commands/link.js')
        cmd(s,l,t)
    })

program.command("export <id> [destinationFile]")
    .description("Export the given ADR to HTML format or to standard output if no file is given. Specify '*' as ID in order to export all. Specify a comma delimited list of IDs to export a subset of ADRs")
    .action((id,dest) => {
        let cmd = require('./commands/export.js')
        cmd(id,dest)
    })

program.command("content <id>")
    .description("Output the content of the ADR with the given id")
    .action(_ => executeSingleParamCommand("content",_))

program.command("edit <id>")
    .description("Launch the configured editor for the given ADR")
    .action(_ => executeSingleParamCommand("edit",_))

program.command("search <term>")
    .description("Search the ADRs for the given term")
    .action(_ => executeSingleParamCommand("search",_))

program.command("diagram [destinationFile]")
    .description("Create and output a network diagram (HTML-based) of the current ADRs")
    .action(_ => executeSingleParamCommand('diagram',_))

process.on('uncaughtException', (err) => {
  console.error(`${err}`)
});

program.parse(process.argv)

if (!program.args.length) {
   console.error('No command provided');
   program.help()
}
