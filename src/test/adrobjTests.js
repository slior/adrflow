"use strict"

const should = require('should')
const rewire = require('rewire')

const adrObj = rewire('../core/adrobj.js')

describe('adrMetadata', () => {
    it("should return an object with all the metadata retrieved about the ADR", () => {
        let MOCK_FILENAME = "1_Mock.md"
        let MOCK_ADR_TITLE = "Mock"
        let MOCK_CONTENT = "Some content"

        let revertDeps = adrObj.__set__({
            path : {
                basename : path => path
            }
            , indexedADRFile : fname => { return { filename : fname, id : 1}}
            , filenameDef : () => { return {
                titleFromFilename : _ => MOCK_ADR_TITLE
            }}
            , adrContentFromFilename : _ => MOCK_CONTENT
            , linksMetadata : _ => []
        })

        let result = adrObj.adrMetadata(MOCK_FILENAME)

        result.should.have.keys("id","filename","title","links")

        result.id.should.equal(1)
        result.filename.should.equal(MOCK_FILENAME)
        result.title.should.equal(MOCK_ADR_TITLE)
        result.links.should.eql([])

        

        revertDeps()
    })
})