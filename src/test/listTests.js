"use strict"

const should = require('should')
const rewire = require('rewire')

const underTest = rewire('../commands/list.js')

describe('List command',() => {

    let mockADRList = ['1-adr1.md','2-adr2_2.md']

    it("should list all available ADR files to the console",() => {
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

        underTest({})

        revert()
    })

    it ("should list only bare files when the bare option is turned on", () => {
        let revert = underTest.__set__({
            withAllADRFiles : (cb) => { cb(mockADRList)}
            , console : {
                info : (msg) => {
                    mockADRList.find(a => a == msg).should.eql(msg)
                }
            }
        })

        underTest({bare : true})
        revert()
    })
})