"use strict"

const should = require('should')
const rewire = require('rewire')

const underTest = rewire('../commands/list.js')

describe('List command',() => {

    it("should list all available ADR files to the console",() => {
        let mockADRList = ['1-adr1.md','2-adr2_2.md']
        let revert = underTest.__set__({
            withAllADRFiles : (cb) => { cb(mockADRList)}
            , console : {
                table : (data) => {
                    data.map(r => r.filename)
                        .forEach(f => {
                            mockADRList.find(fname => fname == f).should.equal(f)
                        })
                }
            }
        })

        underTest()

        revert()
    })
})