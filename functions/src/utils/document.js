function getDocument(doc) {
  return Object.assign({ docID: doc.id }, doc.data())

}

module.exports = { getDocument };