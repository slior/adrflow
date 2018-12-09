"use strict"

const should = require('should')
const rewire = require('rewire')

const files = rewire('../core/files.js')

describe('resolveADRDir',function() {
    it("Should throw an exception if no ADR dir is found",function() {
        let revert = files.__set__({
            walker : (_,__) => []
        })

        should.throws(() => {
            files.resolveADRDir('.')
        }, /no adr directory found/i,"should fail with 'no adr directory found'")

        revert()
    })
})