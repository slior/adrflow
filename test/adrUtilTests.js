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

    revert()
  })

  it("should return the filename of the ADR, if found",() => {

    let revert = IC.__set__({
      findADRDir : (startFrom, callback,notFoundHandler) => { callback('.') }
      , withAllADRFiles : (adrDir, callback) => { callback(['1-adr1.md','2-adr2.md'])}
    })

    IC.adrFileByID('.',2, 
                   (file) => { file.should.equal('2-adr2.md') }, 
                   () => {  should.fail("file should've been found")})

    revert()
  })
})


describe("modifyADR",() => {
  it("should fail if the given ADR ID is not found",() => {
    let revert = IC.__set__({
       findADRDir : (startFrom, callback,notFoundHandler) => { callback('.') }
      , adrFileByID : (adrDir,adrID, cb, errHandler) => { errHandler() }
    })

    //input doesn't matter - the mock implementation will invoke the error handler anyway
    let block = () => {  IC.modifyADR(".","1"); } 
    block.should.throw()

    revert()
  })

  it("should modify an ADR file as requested and call the post modification callback", () => {
    let mockContent = "test"
    let revert = IC.__set__({
      adrFileByID : (adrDir,adrID, cb, errHandler) => { cb("adr" + adrID) }
      , fs : {
        writeFileSync : (file,content) => {
          content.should.equal(mockContent)
        }
      }
      , adrContent : (file) => "some file content"
    })

    IC.modifyADR(".","1",(content) => mockContent, (dir,id) => {
      id.should.equal("1")
      dir.should.equal(".")
    })
    revert()
  })
})