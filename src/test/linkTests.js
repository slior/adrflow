"use strict"

const should = require('should')
const rewire = require('rewire')

const underTest = rewire('../commands/link.js')
const linksMock = rewire("../core/links.js")
const {EOL} = require("../commands/adr_util.js")


let mockContent = `
# 42 Lorem ipsum dolor sit amet, consectetur adipiscing elit

## Status

Proposed 2017-07-20

## Context
Pellentesque consequat odio dolor, vel pulvinar nibh aliquam in. 
Nam aliquam sapien in arcu tincidunt consequat. 
Mauris lacus lectus, sollicitudin a rhoncus vitae, ultrices eu quam. 
Nunc condimentum sem risus, et euismod libero finibus id. 

## Decision

Curabitur vitae justo vitae sapien efficitur venenatis. 
Nunc imperdiet, sem eget maximus ultricies, leo odio porttitor mauris, 
sed malesuada metus sem vitae turpis. Sed eget lorem vehicula, luctus odio vitae, auctor neque.

## Consequences
Mauris dictum imperdiet aliquam. Ut consectetur tellus quis placerat vestibulum. 

`

describe("Link Command", () => {
    it ("should add the given link text to the content of the ADR", () => {
        let src = 1
        let target = 2
        let link = "testLink"
        let mockADRFile = "2.md"

        let reverseLinks = linksMock.__set__({
            filenameFor : _ => mockADRFile
        })

        let reverse = underTest.__set__({
            modifyADR : (_,contentCB,__) => {
                let newContent = contentCB(mockContent)
                let expectedText = `${link} [${target}](${mockADRFile})${EOL+EOL}## Context`
                newContent.indexOf(expectedText).should.be.above(0)
            }
            , linkCodeFor : linksMock.linkMarkdown
        })

        underTest(src,link,target)

        reverse()
        reverseLinks()
    })

    it("should throw an error when no source is given", () => {
        let block = () => {underTest(null,"test",2)}
        block.should.throw()

        let block2 = () => {underTest("","test",2)}
        block2.should.throw()
    })

    it("should throw an error when no target is given", () => {
        let block = () => {underTest(1,"test",null)}
        block.should.throw()

        let block2 = () => {underTest(1,"test",undefined)}
        block2.should.throw()
    })

    it("should default to a default link text when no link text is given",() => {
        let src = 1
        let target = 2
        let mockADRFile = "2.md"

        let reverseLinks = linksMock.__set__({
            filenameFor : _ => mockADRFile
        })

        let reverse = underTest.__set__({
            modifyADR : (_,contentCB,__) => {
                let newContent = contentCB(mockContent)
                let expectedText = `links to [${target}](${mockADRFile})${EOL+EOL}## Context`
                newContent.indexOf(expectedText).should.be.above(0)
            }
            , linkCodeFor : linksMock.linkMarkdown
        })

        underTest(src,"",target)
        underTest(src,undefined,target)
        underTest(src,null,target)

        reverseLinks()
        reverse()
    })
})