"use strict"

const should = require('should')
const rewire = require('rewire')

const IC = rewire('../commands/accept.js')
let { Status, EOL } = require('../commands/adr_util.js')

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
      modifyADR : (d,modifier,postModification) => {
        
        //Specifying the test strings this way, so we won't get confusion with \r\n and \n (if inserted in the editor).
        let testContent = [
          "# Lorem Ipsum"
          ,EOL
          ,"## Status"
          ,EOL
          ,"Proposed 2013-05-13"
          ,EOL
          ,"## Some More Content"
        ].join(EOL)

        let expectedContent = [
          "# Lorem Ipsum"
          ,EOL
          ,"## Status"
          ,EOL
          ,"Proposed 2013-05-13"
          ,"" //imitates the behavior of the modifyADR
          ,`${Status.ACCEPTED()}`
          ,EOL
          ,"## Some More Content"
        ].join(EOL)

        let newContent = modifier(testContent)
        newContent.should.equal(expectedContent)
      }
    })

    IC(1)

    revert()

  })
/*
  it("should not interfere with existing links when adding the Accepted stauts",() => {
    let revert = IC.__set__({
      modifyADR : (dir,id,modifier,postModification) => {
        
      let testContent = `
          # Lorem Ipsum

          ## Status

          Proposed 2013-05-13
          
          some_link [text](url)

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
          console.log(`new content:\n${newContent}`)
          newContent.should.equal(expectdContent)
        }
    })

    IC(1) //adr accept 1
    revert()
  })
  */
})
