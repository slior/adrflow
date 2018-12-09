"use strict"

let {contentOf} = require("./core/adrobj.js")

let promisedContentOf = id => {
  return new Promise(resolve => resolve(contentOf(id)))
} 

module.exports = {
    promisedContentOf : promisedContentOf
}