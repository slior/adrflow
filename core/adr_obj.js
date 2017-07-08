
const { formatDate } = require("./common.js")

function ADR(id,title,status,context,decision,consequences)
{
  this.id = id
  this.title = title
  this.states = []
  this.states.push(status)
  this.context = context
  this.decision = decision
  this.consequences = consequences

  this.toADRString = () => {
    return `# ${this.id} ${this.title}

## Status

${this.states.join("\n")}

## Context
${this.context}

## Decision
${this.decision}

## Consequences
${this.consequences}

    `
  }

  return this;
}


let STATUS_PROPOSED = (d) => {
  let dt = d || (new Date())
  return `Proposed ${formatDate(dt)}`
}




let createADR = (_id,_title,_status, _context,_decision,_cons) => {
  if (!_id) throw new Error("No ID given for new ADR")
  if (!_title) throw new Error("No title given for new ADR")
  let st = _status || STATUS_PROPOSED()
  let ctx = _context || ""
  let dec = _decision || ""
  let cons = _cons || ""

  return new ADR(_id,_title,st,ctx,dec,cons)
}

module.exports = {
  create : createADR
}
