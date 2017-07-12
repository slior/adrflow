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

})
