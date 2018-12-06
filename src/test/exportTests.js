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

        exportCmd("*",mockFile)

        revert()
    })
})