"use strict"
/**
 * @module Customization
 */


let fs = require('fs-extra')

const CUSTOMIZATION_FILE = "adr_custom.js"
/**
 * @private
 */
var loadedCustomizations = null

/**
 * @private
 * 
 * @param {string} adrDir The ADR directory from which to load the customization
 */
let loadCustomizations = adrDir => {
    let filename = `${adrDir}/${CUSTOMIZATION_FILE}`
    return fs.pathExistsSync(filename) ? require(filename) : {}
}

module.exports = {
    /**
     
     * Retrieve the customization provided in the customization file.  
     * If these are not loaded, it will take care of loading it
     * @public
     * @function
     * 
     * @param {string} adrDir The ADR directory - where the customization is expected.
     * 
     * @returns The loaded customizations
     */
    customizations : adrDir => {
        if (loadedCustomizations === null)
            loadedCustomizations = loadCustomizations(adrDir)
        return loadedCustomizations
    }
}