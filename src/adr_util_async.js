"use strict"

let {withADRContext} = require('./adr_util_sync.js')

let promisedContentOf = id => withADRContext(utils => {
  return new Promise(resolve => resolve(utils.contentOf(id)))
})

module.exports = {
    promisedContentOf : promisedContentOf
}