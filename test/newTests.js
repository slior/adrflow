const should = require('should')
const rewire = require('rewire')

const IC = rewire('../commands/new.js')

describe('New command',() => {

  let mockFS = {
    outputFile : (filename,content) => {
      console.log(`mock writing to ${filename}`);
      return {
        then : () => { return { catch : () => {} }}
      }
    }
  }

  let mockFindADRDir =  (startFrom, callback,notFoundHandler) => { callback('.') }
  let mockEditorCommand = "mockEditor"
  let mockPropUtil = {
    parse : (file,opts,cb) => {
      cb(undefined,{editor : mockEditorCommand})
    }
  }

  let dummyLaunchEditor = (file,editorCmd) => {}

  it("Should fail if passed an invalid title - that can't be used as a filename", () => {
    let revert = IC.__set__({
      findADRDir : (startFrom, callback,notFoundHandler) => { callback('.') }
      , withAllADRFiles : (adrDir, callback) => { callback(['1-adr1.md','2-adr2.md'])}
    })

    let block = () => {IC(["bla","###"])}
    block.should.throw()

    revert()
  })



  it ("Should assign the next number for the new ADR - one higher than the last available ADR", () => {
    let testTitle = "test"

    var revert = IC.__set__({
      findADRDir : mockFindADRDir
      , withAllADRFiles : (adrDir, callback) => { callback(['1-adr1.md','2-adr2.md'])}
      , adrContent : (num,title,date) => {
        num.should.eql(3) //one higher than 2-adr2.md
      }
      , fs : mockFS
      , propUtil : mockPropUtil
      , launchEditorFor : dummyLaunchEditor
    })

    IC([testTitle])

    revert = IC.__set__({
      findADRDir : mockFindADRDir
      , withAllADRFiles : (adrDir, callback) => { callback(['1-adr1.md','5-adr2.md'])}
      , adrContent : (num,title,date) => {
        num.should.eql(6) //one higher than 5-adr2.md
      }
      , fs : mockFS
      , propUtil : mockPropUtil
      , launchEditorFor : dummyLaunchEditor
    })

    IC(["test"])
    revert();
  })

  it("Should use the title given as title parts when creating the new ADR content", () => {
    let testTitle = "test"
    var revert = IC.__set__({
      findADRDir : mockFindADRDir
      , withAllADRFiles : (adrDir, callback) => { callback(['1-adr1.md'])}
      , adrContent : (num,title,date) => {
        title.should.eql(testTitle)
      }
      , fs : mockFS
      , propUtil : mockPropUtil
      , launchEditorFor : dummyLaunchEditor
    })

    IC([testTitle])
    revert();

    let adrWithSeveralParts = ["adr","part","2"]
    revert = IC.__set__({
      findADRDir : mockFindADRDir
      , withAllADRFiles : (adrDir, callback) => { callback(['1-adr1.md'])}
      , adrContent : (num,title,date) => {
        console.log(`Title mock got: ${title}`)
        title.should.eql(adrWithSeveralParts.join(' '))
      }
      , fs : mockFS
      , propUtil : mockPropUtil
      , launchEditorFor : dummyLaunchEditor
    })

    IC(adrWithSeveralParts)

    revert();
  })

  it("should launch the editor configured in the adr configuration", () => {

    let revert = IC.__set__({
      launchEditorFor : (file,editorCmd) => {
        editorCmd.should.eql(mockEditorCommand)
      }
      , fs : mockFS
      , propUtil : mockPropUtil
    })

    IC(["testadr"])

    revert();


  })
})
