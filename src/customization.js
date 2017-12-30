"use strict"

let fs = require('fs-extra')

const CUSTOMIZATION_FILE = "adr_custom.js"
var loadedCustomizations = null

let loadCustomizations = adrDir => {
    let filename = `${adrDir}/${CUSTOMIZATION_FILE}`
    return fs.pathExistsSync(filename) ? require(filename) : {}
}

module.exports = {
    customizations : adrDir => {
        if (loadedCustomizations === null)
            loadedCustomizations = loadCustomizations(adrDir)
        return loadedCustomizations
    }
}