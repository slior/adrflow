"use strict"

let {withAllADRFiles} = require('./adr_util.js')

let listCmd = () => {
    withAllADRFiles(files => {
        files.forEach(file => {
            console.info(file)
        });
    })
}


module.exports = listCmd
