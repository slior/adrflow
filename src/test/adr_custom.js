
/*
    A mock customization file, here for testing purposes.
*/

module.exports = {
    filenameDef : {
        matchesDefinedTemplate : filename => customeFileRE.test(filename)
        , fromIDAndName : (id,name) => `${name}-${id}.md`
        , titleFromFilename : filename => {
            let a = customeFileRE.exec(filename)
            if (!a) throw new Error(`${filename} doesn't match an ADR file pattern`)
            return a[1].split('_').join(' ')
        }
        , idFromName : filename => {
            let a = customeFileRE.exec(filename)
            if (!a) throw new Error(`${filename} doesn't match an ADR file pattern`)
            return a[2]*1
        }
    }
}