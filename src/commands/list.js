"use strict"

let {findADRDir, withAllADRFiles} = require('./adr_util.js')

let listCmd = () => {
    findADRDir((adrDir) => {
                    withAllADRFiles(adrDir,(files) => {
                        files.forEach((file) => {
                            console.info(file)
                        });
                    })
                })
}


module.exports = listCmd
