"use strict"

const should = require('should')
const rewire = require('rewire')

const IC = rewire('../commands/accept.js')
let { Status } = require('../commands/adr_util.js')

describe('Accept command',() => {

  it("should fail if no ADR id is given", () => {
    let block = () => {IC()}
    block.should.throw()
  })

  it("should fail if the ADR id given is not a number",() => {
    let block = () => { IC("nan")}
    block.should.throw()
  })

  it("should add an Accepted status to an existing ADR", () => {

    let revert = IC.__set__({
      modifyADR : (dir,id,modifier,postModification) => {
        
        let testContent = `
        # Lorem Ipsum

        ## Status

        Proposed 2013-05-13

        ## Some More Content
        `

        let expectdContent = `
        # Lorem Ipsum

        ## Status

        Proposed 2013-05-13
        Accepted ${Status.ACCEPTED()}

        ## Some More Content
        `

        let newContent = modifier(testContent)
        newContent.should.equal(expectdContent)
      }
    })



    revert()

  })
})
