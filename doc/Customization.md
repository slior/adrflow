# Customizing ADRFlow

It is possible to customize some aspects of the ADRFlow operation. Customization, however, assumes coding abilities, and requires some coding in Javascript, albeit simple enough.  
See [ADR #7](./adr/7-Defining_Customizations.md) for some more details.

Note: this is different from configurations, which are generally just simple values used to configure how the program behaves.

## Where to Place Customizations
Customizations are specified in a specific file, called `adr_custom.js`, which is to be placed in the ADR directory, right next to the `.adr` file.

The customization file is a simple node module, exporting specific functionalities, as per the customization. Each customization described below defines the expected functions/objects to be defined in order for this customization to be picked up.

## Specific Customizations

### Filename Pattern
In order to specify a custom file name pattern to be used for ADRs, you need to export (from `adr_custom.js`) an object under the key - `filenameDef`.  
The returned object completely replaces the default ADR file naming scheme.

This object has to contain the following methods:
|Method|Parameters|Description|
|------|----------|-----------|
| matchesDefinedTemplats| `filename` | Whether or not the given filename matches the new template |
| fromIDAndName | `id`, `name` | Given an ID and name, return a string for a file name for the new ADR |
| titleFromFilename | `filename` | given a file name, return the ADR from it. |
| idFromName | `filename` | given an ADR file name, return the ADR ID from it. |

An example definition:
```
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
```
