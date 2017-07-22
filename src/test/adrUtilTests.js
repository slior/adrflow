"use strict"

const should = require('should')
const rewire = require('rewire')

const IC = rewire('../commands/adr_util.js')
describe("ADR Utils", () => {


  describe("adrFileByID", () => {
    it("should invoke the error handler if no matching ADR is found ", () => {
      let revert = IC.__set__({
        findADRDir : (startFrom, callback,notFoundHandler) => { callback('.') }
        , withAllADRFiles : (callback) => { callback(['1-adr1.md','2-adr2.md'])}
      })
      
      IC.adrFileByID(5, (file) => { should.fail("should not find adr 5") }, () => { /* ok */})

      revert()
    })

    it("should return the filename of the ADR, if found",() => {

      let revert = IC.__set__({
        findADRDir : (startFrom, callback,notFoundHandler) => { callback('.') }
        , withAllADRFiles : (callback) => { callback(['1-adr1.md','2-adr2.md'])}
      })

      IC.adrFileByID(2, 
                    (file) => { file.should.equal('2-adr2.md') }, 
                    () => {  should.fail("file should've been found")})

      revert()
    })
  })


  describe("modifyADR",() => {
    it("should fail if the given ADR ID is not found",() => {
      let revert = IC.__set__({
        findADRDir : ( callback,startFrom,notFoundHandler) => { callback('.') }
        , adrFileByID : (id, cb, errHandler) => { errHandler() }
      })

      //input doesn't matter - the mock implementation will invoke the error handler anyway
      should.throws(() => {
          IC.modifyADR("."
              ,content => { should.fail(null,null,"Should not invoke callback") }
              , () => { should.fail(null,null,"Should not invoke post modification callback")})
        }, /not found/, "did not fail where expected")

      revert()
    })

    it("should modify an ADR file as requested and call the post modification callback", () => {
      let mockContent = "test"
      let revert = IC.__set__({
        adrFileByID : (id,cb, errHandler) => { cb("adr" + adrID) }
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

  describe("lastStatusOf", () => {

    it("should return the correct status for an ADR with proper status",() => {
      let revert = IC.__set__({
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

      IC.lastStatusOf(".","1"
                      , status => {
                          status.should.equal("Proposed 1970-01-01")
                      }
                      , () => { should.fail("Should've found the status")})

      revert()
    })

  }) 

  describe("witnContentOf", () => {
    it("should invoke the given callback, with the content of the ADR", () => {
      let mockContent = "some adr content"
      let revert = IC.__set__({
        adrFileByID : (id,cb) => (cb("mock file"))
        , adrFullPath : (dir,file) => file
        , adrContent : (file) => { return mockContent}
      })

      IC.withContentOf(100,content => {
        content.should.equal(mockContent)
      })

      revert();
    })

    it("should fail if the given ADR ID is not found",() => {
      let revert = IC.__set__({
        findADRDir : ( callback,startFrom,notFoundHandler) => { 
          callback('./doc/adr') }
        , adrFileByID : (id, cb, errHandler) => { errHandler() }
        })

        //input doesn't matter - the mock implementation will invoke the error handler anyway
        should.throws(() => {
          IC.withContentOf(100,content => { should.fail(null,null,"Should not invoke callback") })
        }, /not found/, "did not fail where expected")

        revert()
    })
  })

})