"use strict"

const should = require('should')
const rewire = require('rewire')

const exportCmd = rewire('../commands/export.js')

describe("Export Command",function() {

    let mockHTML = "<html></html>"

    it ("should export all ADRs when given an asterisk, to the given file", function() {
        let mockFile = "out.html"
        let revert = exportCmd.__set__({
            exportAll : file => { file.should.equal(mockFile) }
            , allADRsToHTML : _ => mockHTML
        })

        exportCmd("*",mockFile)

        revert()
    })

    it ("should output to console if no file is given",function() {
        let mockID = "1"
        let mockContent = "OUT"
        let expectedHTML = `<html><body style="font-family:Arial">${mockContent}</body></html>`
        
        let revert = exportCmd.__set__({
            console :  { 
                log : s => s.should.equal(expectedHTML)
            }
            , withHTMLContentFor : (id,cb) => {
                id.should.eql(mockID)
                cb(mockContent)
            }
        })

        exportCmd(mockID,"")

        revert()
    })

    it("should try to parse only the requested ADRs when a subset is requested", function() {
        let mockADRFiles = ["1-adr1.md","2-adr2.md", "3-adr3.md"]
        let mockOutFile = "out.html"
        let revert = exportCmd.__set__({
            withAllADRFiles : f => {
                f(mockADRFiles)
            }, 
            exportFiles : (files,destFile) => {
                files.should.eql([mockADRFiles[0],mockADRFiles[2]])
                destFile.should.eql(mockOutFile)
            }
            , allADRsToHTML : _ => mockHTML
        })

        exportCmd("1,3",mockOutFile)

        revert()
    })

    it("should not crash if no content is available", function() {

        let OK_CONTENT = `
        ## Mock ADR

        # bla

        # bla
        `

        let EMPTY_CONTENT = ''

        let mockADRFiles = ["1-adr1.md","2-adr2.md"]

        function mockDispatch(file,content,msg)
        {
            content.should.match(/Mock ADR/g)
            console.log(`Pretending to write to console`)
        }

        let _console = console

        exportCmd.__with__({
            contentOf : filename => filename == mockADRFiles[0] ? OK_CONTENT : EMPTY_CONTENT
            , dispatchOutput : mockDispatch
            , withAllADRFiles : f => {
                            f(mockADRFiles)
                        }
            , 
        })(function() {

            exportCmd("1,2")
        })
    })
})