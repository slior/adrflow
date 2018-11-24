"use strict"

const should = require('should')
const rewire = require('rewire')

const diag = rewire('../commands/diagram.js')

describe('diagram command',() => {

    it ("should output mock ADR to default file name", () => {
        let reverseDiag = diag.__set__({
            allADRFiles : _ => ["1-mock.md"]
            , adrMetadata : filename => {
                return {
                    filename : "1-mock.md"
                    , id : 1
                    , title : "Mock ADR"
                    , links : []
                }
            }
            , outputDiagram : (outFile,content) => {
                outFile.should.equal("diagram.html")
                content.should.match(/Mock ADR/) //some assertion on the content - that it has the title we put in.
            }
        })

        diag()

        reverseDiag()
    })

})