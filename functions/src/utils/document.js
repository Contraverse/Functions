function getDocument(doc) {
  return {
    docID: doc.id,
    ...doc.data()
  }
}

module.exports = { getDocument };