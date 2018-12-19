"use strict"

const should = require('should')
const rewire = require('rewire')

const underTest = rewire('../commands/status.js')

describe('Status command',() => {

    it("should log the given status to console",() => {
        let mockStatus = "some status"
        let revert = underTest.__set__({
            lastStatusOf : (id, cb, notFound) => { cb( mockStatus)}
            , console : {
                info : msg => { msg.should.equal(mockStatus) }
            }
        })

        underTest("1")

        revert()
    })

    it ("should output an error if no status is found", () => {
        let revert = underTest.__set__({
            lastStatusOf : (id, cb, notFound) => { notFound() }
            , console : {
                error : () => { /* ok */ console.log("Not found handler invoked") }
            }
        })

        underTest("1")

        revert()
    })

    it("should return the correct status for an ADR with proper status",() => {
        let revert = underTest.__set__({
          adrFileByID : (id,cb) => (cb("mock file"))
          , adrFullPath : (dir,file) => file
          , adrContent : (file) => {
            return `
            # 22 Some ADR
  
            ## Status
  
            Proposed 1970-01-01
  
            ## Context
            Lorem Ipsum
  
            ## Decision
            Bla bla
  
            ## Consequences
            Seriously?
            `
          }
        })
  
        underTest("1", status => {
                                status.should.equal("Proposed 1970-01-01")
                            })

        revert()
      })
})
