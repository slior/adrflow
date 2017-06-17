
const should = require('should')
const rewire = require('rewire')

const IC = rewire('../commands/init.js')

describe('Init command',function() {
  it("should create the directory passed to it and issue a proper console log", () => {
    let testDir = "sample"
    let revert = IC.__set__({
      fs : {
        ensureDir : (dir) => {
           dir.should.eql(testDir)
           return {
             then : () => { return { catch : () => {} }}
           }
        }
      }
      , console : {
        log : (msg) => { msg.should.eql("Created " + testDir)}
      }
    })

    IC(testDir)

    revert()
  })

  it ("should default to default directory if no argument is passed", () => {
    let defaultDir = 'doc/adr'
    let revert = IC.__set__({
      fs : {
        ensureDir : (dir) => {
           dir.should.eql(defaultDir)
           return {
             then : () => { return { catch : () => {} }}
           }
        }
      }
      , console : {
        log : (msg) => { msg.should.eql("Created " + defaultDir)}
      }
    })

    IC("")

    revert()
  })
})
