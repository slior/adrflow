"use strict"

let utils = require('./adr_util_sync.js').createUtilContext()



let promisedContentOf = id => {
  return new Promise(resolve => resolve(utils.contentOf(id)))
} 

module.exports = {
    promisedContentOf : promisedContentOf
}