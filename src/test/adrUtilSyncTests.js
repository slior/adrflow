"use strict"

const should = require('should')
const rewire = require('rewire')

const utils = rewire('../adr_util_sync.js')
const files = rewire('../core/files.js')

const testInvalidIDThrowsException = block => {
    //Could not find ADR file for ADR
    should.throws(block, /Could not find ADR file for ADR/i,"should throw a 'not found exception'")
}

describe("Synchronous ADR Utils", () => {
    describe("contentOf", () => {
        
        it ("should throw an exception when an invalid ADR ID is given",function (done) {
            this.timeout(5000)    
            testInvalidIDThrowsException(() => utils.createUtilContext().contentOf("-1"))
            done()
        })

        it("should throw an exception if no ADR directory is found",() => {
            let revert = utils.__set__({
                resolveADRDir : _ => { throw new Error("No ADR directory found from ")}
            })

            should.throws(() => {
                utils.createUtilContext().contentOf("1")
            },/no adr directory found/i,"should fail with 'no adr directory found'")

            revert()
        })

        it("should find the file with the correct ADR id, and return whatever is read from it", () => {
            let expectedFilename = "1-blabla.md"
            let expectedFileContent = "some string"
            let revert = utils.__set__({
                resolveADRDir : (start) => "."
                , allADRFiles : () => ["2-test.md",expectedFilename,"1 wrong.md","1_stillwrong.md"]
                , fs : {
                    readFileSync : (filename) => {
                        filename.should.equal(expectedFilename)
                        return expectedFileContent
                    }
                }
            })

            utils.createUtilContext().contentOf(1).should.equal(expectedFileContent)

            revert()
        })
    })

    describe("linksFor",() => {

        const mockData = adrContent => {
            return {
                resolveADRDir : (start) => "."
                , allADRFiles : () => ["1-test.md"]
                , fs : {
                    readFileSync : filename => adrContent
                }
            }
        }

        it("should throw an exception when an invalid ADR id is given",() => {
            testInvalidIDThrowsException(() => utils.createUtilContext().linksFor("-1"))
        })

        it("should find links in the status section, with no markdown link",() => {
            let revert = utils.__set__(mockData(`
            
                                     points_to 2
                                     follows 3
            
                                     ## Context
                                     bla bla
                                     `))

            utils.createUtilContext().linksFor(1).should.deepEqual(["points_to 2", "follows 3"])
            revert()
        })

        it("should find links in the status section, with markdown links, and strip them", () => {
            let revert = utils.__set__(mockData(
                `
                ## Status

                some status ...

                [points_to 2](2-adr.md)
                [follows 3](3-adr.md)

                ## Context
                bla bla
                `
            ))

            utils.createUtilContext().linksFor(1).should.deepEqual(["points_to 2", "follows 3"])
            revert()
        })

        it("should NOT find link that appear in other places in the ADR",() => {
            let revert = utils.__set__(mockData(`
            ## Status

            some status ...

            [points_to 2](2-adr.md)
            [follows 3](3-adr.md)

            ## Context
            bla bla
            and here [some_link 3](3-adr.md)
            some more text

            `))

            utils.createUtilContext().linksFor(1).should.deepEqual(["points_to 2", "follows 3"])
            revert()
        })

        it("should return an empty list if no links are present",() => {
            let revert = utils.__set__(mockData(`
            ## Status

            some status ...

            ## Context
            bla bla
            and here [some_link 3](3-adr.md)
            some more text

            `))

            utils.createUtilContext().linksFor(1).should.deepEqual([])
            revert()
        })

        it("should return links whether they're with or without markdown links",() => {
            let revert = utils.__set__(mockData(`
            ## Status

            some status ...
            
            [overrides_partially 2](2-adr.md)
            mentions 5
            [follows 4](4-adr.md)

            ## Context
            bla bla
            and here [some_link 3](3-adr.md)
            some more text

            `))

            utils.createUtilContext().linksFor("1").should.deepEqual(["overrides_partially 2","mentions 5","follows 4"])
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
})