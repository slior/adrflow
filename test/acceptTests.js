"use strict"

const should = require('should')
const rewire = require('rewire')

const IC = rewire('../commands/accept.js')

describe('Accept command',() => {

  it("should fail if no ADR id is given", () => {
    let block = () => {IC()}
    block.should.throw()
  })

  it("should fail if the ADR id given is not a number",() => {
    let block = () => { IC("nan")}
    block.should.throw()
  })

  it("should fail if the ADR id given is not found",() => {

    let revert = IC.__set__({
       findADRDir : (startFrom, callback,notFoundHandler) => { callback('.') }
      , adrFileByID : (adrDir,adrID, cb, errHandler) => { errHandler() }
    })

    let block = () => {  IC(5); } //5 as representative of some non-existing ADR ID.
    block.should.throw()

    revert()
  })

})
