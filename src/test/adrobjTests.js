"use strict"

const should = require('should')
const rewire = require('rewire')

const adrObj = rewire('../core/adrobj.js')

describe('adrMetadata', () => {
    it("should return an object with all the metadata retrieved about the ADR", function(done) {

        this.timeout(3000)

        let MOCK_FILENAME = "1_Mock.md"
        let MOCK_ADR_TITLE = "Mock"

        let revertDeps = adrObj.__set__({
            path : {
                basename : path => path
            }
            , indexedADRFile : fname => { return { filename : fname, id : 1}}
            , filenameDef : () => { return {
                titleFromFilename : _ => MOCK_ADR_TITLE
            }}
            , linksMetadata : _ => []
        })

        let result = adrObj.adrMetadata(MOCK_FILENAME)

        result.should.have.keys("id","filename","title","links")

        result.id.should.equal(1)
        result.filename.should.equal(MOCK_FILENAME)
        result.title.should.equal(MOCK_ADR_TITLE)
        result.links.should.eql([])

        revertDeps()

        done()
    })

})

const testInvalidIDThrowsException = block => {
    //Could not find ADR file for ADR
    should.throws(block, /Could not find ADR file for ADR/i,"should throw a 'not found exception'")
}

describe('contentOf', function() {
    it ("should throw an exception when an invalid ADR ID is given",function (done) {
        this.timeout(5000)    
        testInvalidIDThrowsException(() => adrObj.contentOf("-1"))
        done()
    })

    it("should find the file with the correct ADR id, and return whatever is read from it", () => {
        let expectedFilename = "1-blabla.md"
        let expectedFileContent = "some string"
        let revert = adrObj.__set__({
            cachedADRFiles : () => ["2-test.md",expectedFilename,"1 wrong.md","1_stillwrong.md"]
            , contentOf : filepath => {
                console.log(`Pretending to read content of ${filepath}`)
                filepath.should.endWith(expectedFilename)
                return expectedFileContent
            }
        })

        adrObj.contentOf(1).should.equal(expectedFileContent)

        revert()
    })

})