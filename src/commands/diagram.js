/** @module DiagramCommand */
"use strict"

let fs = require('fs-extra')
let utils = require('../adr_util_sync.js').createUtilContext()
let {writeTextFileAndNotifyUser} = require('./common.js')

let nodeJSCode = (id,title) => `{id : ${id}, label : "${id}: ${title}", shape : 'box'}`

let diagramHTMLFor = (title,nodes,edges) => `
<!doctype html>
<html>
<head>
  <title>${title}</title>

  <style type="text/css">
    #adrnetwork {
      width: 1000px;
      height: 800px;
      border: 1px solid lightgray;
    }
  </style>

  <script type="text/javascript" src="https://cdnjs.cloudflare.com/ajax/libs/vis/4.21.0/vis.min.js"></script>
  <link href="https://cdnjs.cloudflare.com/ajax/libs/vis/4.21.0/vis-network.min.css" rel="stylesheet" type="text/css" />
  <script>
    function draw()
    {
        var nodes = [${nodes}]
        var edges = [${edges}]
        var container = document.getElementById('adrnetwork');
        var data = {
          nodes: nodes,
          edges: edges
        };
        var options = {physics:{barnesHut:{gravitationalConstant:-4000}}, layout:{ hierarchical: true }};
        network = new vis.Network(container, data, options);
    }
  </script>
</head>
<body onload="draw()">

<p>
  Architecture Decision Records and their references
</p>
<div id="adrnetwork"></div>

<div id="info"></div>
</body>
</html>
`

function outputDiagram(filename,html)
{
  writeTextFileAndNotifyUser(filename,html,`Outputting diagram to ${filename} ...`)
}

/**
 * Generate the code for creating an edge between ADRs
 * 
 * @private
 * @function
 * 
 * @param {string} source The source ID
 * @param {string} target The target ADR ID
 * @param {String} label The target label ID
 */
let edgeJSCode = (source,target,label) => `{from : ${source}, to: ${target}, label: "${label}", arrows : { to : {enabled : true}}}`
/**
 * Executes the diagram command.
 * This will also notify users on the progress, in the console.
 * 
 * @param {string} outputFile The file to output the diagram code to.
 */
let diagramCmd = (outputFile) => {
    console.info("Extracting metadata...")
    let allADRsMetadata = utils.adrFiles.map(utils.metadataFor)
    console.info("Generating HTML...")
    let diagramNodesJSCode = allADRsMetadata.map(adrMD => nodeJSCode(adrMD.id,adrMD.title)).join(",")
    let allEdges = []
    allADRsMetadata.forEach(adrMD => {
        let linksFromThisADR = adrMD.links.map( linkMD => edgeJSCode(adrMD.id, linkMD.target, linkMD.text)).join(",")
        allEdges.push(linksFromThisADR)
    })
    let diagramEdgesJSCode = allEdges.filter(edgesJS => edgesJS !== "").join(",")
    let html = diagramHTMLFor("ADRs",diagramNodesJSCode,diagramEdgesJSCode)
    outputDiagram(outputFile || "diagram.html",html)
}

module.exports = diagramCmd