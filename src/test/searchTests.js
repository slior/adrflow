"use strict"

const should = require('should')
const rewire = require('rewire')

const searchCmd = rewire('../commands/search.js')

describe("Search command",() => {

    it("provide correct parameters to the search function", () => {
        let DUMMY_SEARCH_TERM = "bs"
        let revert = searchCmd.__set__({
            findInFiles : {
                findSync : (term,directory,fileFilter) => {
                    term.should.eql(DUMMY_SEARCH_TERM)
                    directory.should.be.String()
                    fileFilter.should.eql('.md$')

                    return Promise.resolve([])
                }
            }
        })

        searchCmd(DUMMY_SEARCH_TERM)
        revert()
    })
})