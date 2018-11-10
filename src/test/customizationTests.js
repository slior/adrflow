"use strict"

const rewire = require('rewire')

const utils = rewire('../adr_util_sync.js')
const files = rewire('../core/files.js')
const customizationModule = rewire('../customization.js')

describe("customizing filenames", () => {
    it ("should match filenames according to customized definitions", () => {
        let revertFiles = files.__set__({
            customizations : _ => {
                let customeFileRE = /^([\w_ -]+)[- ](\d+)\.md$/
                return {
                    filenameDef : {
                        matchesDefinedTemplate : filename => customeFileRE.test(filename)
                        , fromIDAndName : (id,name) => `${name}-${id}.md`
                        , titleFromFilename : filename => {
                            let a = customeFileRE.exec(filename)
                            if (!a) throw new Error(`${filename} doesn't match an ADR file pattern`)
                            return a[1].split('_').join(' ')
                        }
                        , idFromName : filename => {
                            let a = customeFileRE.exec(filename)
                            if (!a) throw new Error(`${filename} doesn't match an ADR file pattern`)
                            return a[2]*1
                        }
                    }
                }
            }
        })

        let revertUtils = utils.__set__({ //not great: the test is going into the internal implementation of the utils module
            resolveFilenameDefinition : files.resolveFilenameDefinition
        })

        let filenameDef = utils.adrFilename() 

        filenameDef.titleFromFilename("some_title-3.md").should.equal("some title")
        filenameDef.idFromName("name-45.md").should.equal(45)
        filenameDef.matchesDefinedTemplate("gaga_bla_gla-21.md").should.equal(true)
        filenameDef.fromIDAndName(12,"BlUe").should.equal("BlUe-12.md") //also checks that it keep the letter's case.

        // revert()
        revertFiles()
        revertUtils()
    })
})

describe("customization script",() => {
    it("should pick up the 'adr_custom.js' file, if present in the ADR directory", () => {
        let mockDir = './test' //should be the test directory, where the mock file resides
        let revert = customizationModule.__set__({
            fs : {
                pathExistsSync : path => {
                    path.should.startWith(mockDir + '/')
                    return true
                }
            }
        })

        let testCustomization = customizationModule.customizations(mockDir)
        testCustomization.should.not.be.null
        //the following tests some of the content in ./test/adr_custom.js. Just to make it was loaded properly
        testCustomization.filenameDef.should.exist
        testCustomization.filenameDef.fromIDAndName.should.be.Function()

        revert()
    })
})