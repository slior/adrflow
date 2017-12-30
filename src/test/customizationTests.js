"use strict"

const should = require('should')
const rewire = require('rewire')

const utils = rewire('../adr_util_sync.js')

describe("customizing filenames", () => {
    it ("should match filenames according to customized definitions", () => {
        let revert = utils.__set__({
            customizations : adrDir => {
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

        let filenameDef = utils.adrFilename()

        filenameDef.titleFromFilename("some_title-3.md").should.equal("some title")
        filenameDef.idFromName("name-45.md").should.equal(45)
        filenameDef.matchesDefinedTemplate("gaga_bla_gla-21.md").should.equal(true)
        filenameDef.fromIDAndName(12,"BlUe").should.equal("BlUe-12.md") //also checks that it keep the letter's case.

        revert()
    })
})