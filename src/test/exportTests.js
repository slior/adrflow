"use strict"

const should = require('should')
const rewire = require('rewire')

const exportCmd = rewire('../commands/export.js')

describe("Export Command",function() {
    it ("should export all ADRs when given an asterisk, to the given file", function() {
        let mockFile = "out.html"
        let revert = exportCmd.__set__({
            exportAll : file => { file.should.equal(mockFile) }
        })

        exportCmd(mockFile)

        revert()
    })

    it ("should output to console if no file is given",function() {
        let mockHTML = "<html></html>"
        let revert = exportCmd.__set__({
            console :  { 
                log : s => s.should.equal(mockHTML)
            }
            , allADRsToHTML : _ => mockHTML
        })

        exportCmd("1","")

        revert()
    })
})