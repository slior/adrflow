"use strict"

const should = require('should')
const rewire = require('rewire')

const IC = rewire('../commands/adr_util.js')

describe("adrFileByID", () => {
  it("should invoke the error handler if no matching ADR is found ", () => {
    let revert = IC.__set__({
      findADRDir : (startFrom, callback,notFoundHandler) => { callback('.') }
      , withAllADRFiles : (adrDir, callback) => { callback(['1-adr1.md','2-adr2.md'])}
    })

    IC.adrFileByID('.',5, (file) => { should.fail("should not find adr 5") }, () => { /* ok */})

  })
})
