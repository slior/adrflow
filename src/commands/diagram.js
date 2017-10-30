"use strict"

let fs = require('fs-extra')
let utils = require('../adr_util_sync.js').createUtilContext()

let nodeJSCode = (id,title) => `{id : ${id}, label : "${title}", shape : 'box'}`

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
        var edges = []
        var container = document.getElementById('adrnetwork');
        var data = {
          nodes: nodes,
          edges: edges
        };
        var options = {physics:{barnesHut:{gravitationalConstant:-4000}}};
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
  console.info(`Outputting diagram to ${filename} ...`)
  fs.outputFile(filename,html)
    .then(() => { console.info("Done.")})
    .catch((err) => { console.error(err)})
}

let diagramCmd = (outputFile) => {
    console.info("Extracting metadata...")
    let allADRsMetadata = utils.adrFiles.map(utils.metadataFor)
    console.info("Generating HTML...")
    let diagramNodesJSCode = allADRsMetadata.map(adrMD => nodeJSCode(adrMD.id,adrMD.title)).join(",")
    let diagramEdgesJSCode = {}
    let html = diagramHTMLFor("ADRs",diagramNodesJSCode,diagramEdgesJSCode)
    outputDiagram(outputFile || "diagram.html",html)
}

module.exports = diagramCmd