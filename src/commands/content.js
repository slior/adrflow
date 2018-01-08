/**
 * The `content` command 
 * @module 
 */
"use strict"

let {withContentOf} = require('./adr_util.js')

/**
 * Output the content of the given ID, if availablem to the console.
 * 
 * @param {number} id - The ID of the ADR to output
 */
let contentCmd = (id) => {
    withContentOf(id
                , content => {
                    console.info(content)
                }
    )
}

module.exports = contentCmd