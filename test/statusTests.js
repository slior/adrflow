"use strict"

const should = require('should')
const rewire = require('rewire')

const underTest = rewire('../commands/status.js')

describe('Status command',() => {

    it("should log the given status to console",() => {
        let mockStatus = "some status"
        let revert = underTest.__set__({
            findADRDir : cb => { cb('.')}
            , lastStatusOf : (dir,id, cb, notFound) => { cb( mockStatus)}
            , console : {
                info : msg => { msg.should.equal(mockStatus) }
            }
        })

        underTest("1")

        revert()
    })

    it ("should output an error if no status is found", () => {
        let revert = underTest.__set__({
            findADRDir : cb => { cb('.')}
            , lastStatusOf : (dir,id, cb, notFound) => { notFound() }
            , console : {
                error : () => { /* ok */ console.log("Not found handler invoked") }
            }
        })

        underTest("1")

        revert()
    })
})
