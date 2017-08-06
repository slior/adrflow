"use strict"

const should = require('should')
const rewire = require('rewire')

const utils = rewire('../adr_util_sync.js')


describe("Synchronous ADR Utils", () => {
    describe("contentOf", () => {
        it ("should throw an exception when an invalid ADR ID is given",() => {
            should.throws(() => {
                utils.contentOf("-1")
            }, /could not find ADR file for ADR/i,"should throw a not found exception")
        })

        it("should throw an exception if no ADR directory is found",() => {
            let revert = utils.__set__({
                walker : (start,opts) => []
            })

            should.throws(() => {
                utils.contentOf("1")
            },/no adr directory found/i,"should fail with 'no adr directory found'")

            revert()
        })

        it("should find the file with the correct ADR id, and return whatever is read from it", () => {
            let expectedFilename = "1-blabla.md"
            let revert = utils.__set__({
                resolveADRDir : (start) => "."
                , allADRFiles : () => ["2-test.md",expectedFilename,"1 wrong.md","1_stillwrong.md"]
                , fs : {
                    readFileSync : (filename) => {
                        filename.should.equal(expectedFilename)
                        return "some string"
                    }
                }
            })

            utils.contentOf("1").should.equal("some string")

            revert()
        })
    })
})