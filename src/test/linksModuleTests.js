"use strict"

const should = require('should')
const rewire = require('rewire')

const links = rewire('../core/links.js')

const testInvalidIDThrowsException = block => {
    //Could not find ADR file for ADR
    should.throws(block, /Could not find ADR file for ADR/i,"should throw a 'not found exception'")
}

describe("linksFor",function() {

    it("should find links in the status section, with no markdown link",() => {
        let mockData = `
        
        points_to 2
        follows 3

        ## Context
        bla bla
        `

        links.linksFor(mockData).should.deepEqual(["points_to 2", "follows 3"])
    })

    it("should find links in the status section, with markdown links, and strip them", () => {
        let mockData =
            `
            ## Status

            some status ...

            [points_to 2](2-adr.md)
            [follows 3](3-adr.md)

            ## Context
            bla bla
            `
        

        links.linksFor(mockData).should.deepEqual(["points_to 2", "follows 3"])
    })

    it("should NOT find link that appear in other places in the ADR",() => {
        let mockData = `
        ## Status

        some status ...

        [points_to 2](2-adr.md)
        [follows 3](3-adr.md)

        ## Context
        bla bla
        and here [some_link 3](3-adr.md)
        some more text

        `

        links.linksFor(mockData).should.deepEqual(["points_to 2", "follows 3"])
    })

    it("should return an empty list if no links are present",() => {
        let mockData = `
        ## Status

        some status ...

        ## Context
        bla bla
        and here [some_link 3](3-adr.md)
        some more text

        `

        links.linksFor(mockData).should.deepEqual([])
    })

    it("should return links whether they're with or without markdown links",() => {
        let mockData = `
        ## Status

        some status ...
        
        [overrides_partially 2](2-adr.md)
        mentions 5
        [follows 4](4-adr.md)

        ## Context
        bla bla
        and here [some_link 3](3-adr.md)
        some more text

        `

        links.linksFor(mockData).should.deepEqual(["overrides_partially 2","mentions 5","follows 4"])
    })

})