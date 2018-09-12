const { getDocument } = require('./document');

function getDocuments(snapshot) {
  return snapshot.docs.map(doc => getDocument(doc))
}

module.exports = { getDocuments };