
const should = require('should')
const rewire = require('rewire')

const IC = rewire('../commands/init.js')

let ensureDirMock = expected => {
  return dir => {
    dir.should.eql(expected)
    return {
      then : () => { return { catch : () => {} }}
    }
  }
}

let mockFS = expectedDir => {
  return { ensureDir : ensureDirMock(expectedDir) }
}

describe('Init command',function() {
  it("should create the directory passed to it and issue a proper console log", () => {
    let testDir = "sample"
    let revert = IC.__set__({
      fs : mockFS(testDir)
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
      fs : mockFS(defaultDir)
      , console : {
        log : (msg) => { msg.should.eql("Created " + defaultDir)}
      }
    })

    IC("")

    revert()
  })
})
