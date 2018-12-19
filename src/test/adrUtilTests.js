"use strict"

const should = require('should')
const ee = require("event-emitter")
const rewire = require('rewire')
const path = require('path')
const common = require('../commands/common.js')

const IC = rewire('../commands/adr_util.js')

describe("ADR Utils", () => {


  describe("adrFileByID", () => {

    let fileByIDMocks = {
        findADRDir : (startFrom, callback,notFoundHandler) => { callback('.') }
        , withAllADRFiles : (callback) => { callback(['1-adr1.md','2-adr2.md'])}
    }

    it("should invoke the error handler if no matching ADR is found ", () => {
      let revert = IC.__set__(fileByIDMocks)
      
      IC.adrFileByID(5, (file) => { should.fail("should not find adr 5") }, () => { /* ok */})

      revert()
    })

    it("should return the filename of the ADR, if found",() => {

      let revert = IC.__set__(fileByIDMocks)

      IC.adrFileByID(2, 
                    (file) => { file.should.equal('2-adr2.md') }, 
                    () => {  should.fail("file should've been found")})

      revert()
    })
  })

  let mockFileByIDWithError = {
        findADRDir : ( callback,startFrom,notFoundHandler) => { callback('.') }
        , adrFileByID : (id, cb, errHandler) => { errHandler() }
      }

  describe("modifyADR",() => {
    it("should fail if the given ADR ID is not found",() => {
      let revert = IC.__set__(mockFileByIDWithError)

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
      let revert = IC.__set__(mockFileByIDWithError)

        //input doesn't matter - the mock implementation will invoke the error handler anyway
        should.throws(() => {
          IC.withContentOf(100,content => { should.fail(null,null,"Should not invoke callback") })
        }, /not found/, "did not fail where expected")

        revert()
    })
  })

  describe("withAllADRFiles", () => {
    it ("should invoke the callback with all the ADR files found in the ADR dir", () => {
      let emitter = ee(Object.prototype)
      let mockFiles = ['1-some file.md', '2-some-other-file.md',".adr","3 some adr.md","non adr.txt"]
      IC.__set__({
        findit : dir => {
          return emitter;
        }
        , findADRDir : cb => { cb('.')}
      })

      IC.withAllADRFiles(files => {
        let result = files.includes(mockFiles[0]) 
                      && files.includes(mockFiles[1])
                      && files.includes(mockFiles[3])
        result.should.equal(true)
      })

      for (var f in mockFiles)
        emitter.emit('file',mockFiles[f],null,null)
      emitter.emit('end')
    })
  })

  describe("withEditorCommandFrom", () => {
    it ("should resolve to shared values when local overrides are not present", () => {
      let revert = IC.__set__({
        propUtil : {
          parse : (filename,props,cb) => {
            let basename = path.basename(filename)
            if (basename === common.localADRConfigFilename)
            {
              throw new Error("local properties not found")
            }
            else //=> the shared properties were asked
              cb(null, {editor : "some editor"}) //calling back with null error and dummy data
          }
        }
        , withFullADRFilename : (id,cb) => {
            cb(id,"1-dummy_adr.md")
        }
        , findADRDir : cb => cb(".")
        , launchEditorFor : (filename,cmd) => { cmd.should.equal("some editor")}
        , fs : {
          existsSync : filename => false //local.adr does not exist in this test
        }
      })

      IC.launchEditorForADR(5)

      revert()
    })
    
  })
})