"use strict"

const should = require('should')
const rewire = require('rewire')

const files = rewire('../core/files.js')

describe("Files Core Module", function () {


    describe('resolveADRDir',function() {
        it("Should throw an exception if no ADR dir is found",function() {
            let revert = files.__set__({
                walker : (_,__) => []
            })

            should.throws(() => {
                files.resolveADRDir('.')
            }, /no adr directory found/i,"should fail with 'no adr directory found'")

            revert()
        })
    })

    describe("adrFilename", () => {
        it("should define the necessary members", () => {
            files.filenameDef().should.have.keys('matchesDefinedTemplate', 'fromIDAndName', 'titleFromFilename', 'idFromName')
            files.filenameDef().fromIDAndName.should.be.Function()
            files.filenameDef().titleFromFilename.should.be.Function()
            files.filenameDef().idFromName.should.be.Function()
            files.filenameDef().matchesDefinedTemplate.should.be.Function()
        })
    })

    describe("titleFromFilename",() => {
        let f = files.filenameDef()
        it("should return correct title from a valid filename", () => {
            f.titleFromFilename("3-some_title.md").should.equal("some title")
        })

        it("should throw an invalid filename extension for an empty filename", () => {
            should.throws(() => { f.titleFromFilename("") }, 
                            /doesn't match an ADR file pattern/i,
                            "Should fail on an invalid pattern error")
        })

        it("should throw an invalid filename extension for an invalid pattern", () => {
            should.throws(() => { f.titleFromFilename("1_some_file") }, 
                            /doesn't match an ADR file pattern/i,
                            "Should fail on an invalid pattern error")
        })
    })

    describe("idFromName",() => {
        let f = files.filenameDef().idFromName

        it("should return correct id from a valid filename",() => {
            f("3-some_title.md").should.equal(3)
        })

        it("should throw an invalid filename extension for an empty filename", () => {
            should.throws(() => { f("") }, 
                          /doesn't match an ADR file pattern/i,
                          "Should fail on an invalid pattern error")
        })

        it("should throw an invalid filename extension for an invalid pattern", () => {
            should.throws(() => { f("1_some_file") }, 
                          /doesn't match an ADR file pattern/i,
                          "Should fail on an invalid pattern error")
        })
    })

    describe("matchesDefinedTemplate",() => {
        let f = files.filenameDef().matchesDefinedTemplate

        it ("should return TRUE for matching filenames",() => {
            f("1-blabla.md").should.equal(true)
            f("13-test_test_test.md").should.equal(true)
        })

        it ("should return FALSE for non-matching filenames, including empty string",() => {
            f("").should.equal(false)
            f("2_1_2_test").should.equal(false)
            f(".md").should.equal(false)
            f("544-.md").should.equal(false)
        })
    })

})