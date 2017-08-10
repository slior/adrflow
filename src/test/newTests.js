"use strict"

const should = require('should')
const rewire = require('rewire')
const utils = require('../adr_util_sync.js').createUtilContext()

const underTest = rewire('../commands/new.js')

describe('New command',() => {

  let mockFS = {
    outputFile : (filename,content) => {
      console.log(`mock writing to ${filename}`);
      return {
        then : () => { return { catch : () => {} }}
      }
    }
  }

  let mockFindADRDir =  ( callback,startFrom,notFoundHandler) => { callback('.') }
  let mockEditorCommand = "mockEditor"
  let mockPropUtil = {
    parse : (file,opts,cb) => {
      cb(undefined,{editor : mockEditorCommand})
    }
  }

  let dummyLaunchEditor = (file,editorCmd) => {}

  let commonMocks = {
    fs : mockFS
    , propUtil : mockPropUtil
    , launchEditorFor : dummyLaunchEditor
    , withADRContext : block => {
        let mockContext = {
            filenameFor : id => mockADRFile
            , launchEditorForFile : file => {}
        }
        return block(mockContext)
    }
  }

  function modifiedCommonMocks(specificMocks) {
    let copy = {}
    for (var k in commonMocks) copy[k] = commonMocks[k]
    for (var j in specificMocks) copy[j] = specificMocks[j]
    return copy;
  }

  it("Should fail if passed an invalid title - that can't be used as a filename", () => {
    let revert = underTest.__set__({
      findADRDir : (startFrom, callback,notFoundHandler) => { callback('.') }
      , withAllADRFiles : (callback) => { callback(['1-adr1.md','2-adr2.md'])}
    })

    let block = () => {underTest(["bla","###"])}
    block.should.throw()

    revert()
  })

  let mocksWithHighestNumber = n => {
    return {
      utils : Object.assign(utils,{
        adrFiles : ['1-adr1.md', n + '-adr2.md']
        , adrContent : (num,title) => { num.should.eql(n+1)}
      })
      , writeADR : (file,content) => {}
      , withADRContext : block => {
          let mockContext = {
              filenameFor : id => mockADRFile
              , launchEditorForFile : file => {}
              , adrFiles : ['1-adr1.md', n + '-adr2.md']
              , baseFilename : f => f
          }
          return block(mockContext)
        }
    }
  }
  let testTitle = "test"

  it ("Should assign the next number for the new ADR - one higher than the last available ADR", () => {
    let revert = underTest.__set__(modifiedCommonMocks(mocksWithHighestNumber(2)))
    underTest([testTitle])
    revert()
  })

  it("should assign the next number for the new ADR - one higher than the last available ADR (non-consecutive)",() => {
    let revert = underTest.__set__(modifiedCommonMocks(mocksWithHighestNumber(5)))
    underTest([testTitle])
    revert();
  })

  it("should use the title given as title parts when creating the new ADR content", () => {
    // let testTitle = "test"
    let revert = underTest.__set__(modifiedCommonMocks({
      findADRDir : mockFindADRDir
      , withAllADRFiles : (callback) => { callback(['1-adr1.md'])}
      , adrContent : (num,title,date) => {
        title.should.eql(testTitle)
      }
      , withADRContext : block => {
          let mockContext = {
              filenameFor : id => mockADRFile
              , launchEditorForFile : file => {}
              , adrFiles : ['1-adr1.md']
              , baseFilename : f => f
          }
          return block(mockContext)
        }
    }))
    underTest([testTitle])
    revert();
  })

  it("should use the title given as title parts when creating the new ADR content (multiple parts)", () => {
    

    let adrWithSeveralParts = ["adr","part","2"]
    let revert = underTest.__set__(modifiedCommonMocks({
      findADRDir : mockFindADRDir
      , withAllADRFiles : (callback) => { callback(['1-adr1.md'])}
      , adrContent : (num,title,date) => {
        console.log(`Title mock got: ${title}`)
        title.should.eql(adrWithSeveralParts.join(' '))
      }
      , withADRContext : block => {
          let mockContext = {
              filenameFor : id => mockADRFile
              , launchEditorForFile : file => {}
              , adrFiles : ['1-adr1.md']
              , baseFilename : f => f
          }
          return block(mockContext)
        }
    }))

    underTest(adrWithSeveralParts)

    revert();
  })

  it("should launch the editor configured in the adr configuration", () => {

    let testTitle = "testadr"
    let revert = underTest.__set__(modifiedCommonMocks({
      utils : {
        config : { editor : mockEditorCommand }
        , adrDir : '.'
      }
      , writeADR : () => {}
      , nextADRNumber : () => 1
      , exec : (cmd) => { cmd.should.eql(`${mockEditorCommand} ./1-${testTitle}.md`)}
    }))

    underTest([testTitle])

    revert();


  })
})
