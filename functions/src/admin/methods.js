const admin = require('firebase-admin');

function removePoll(pollID) {
  const db = admin.firestore();
  return Promise.all([
    removeDocument(db.doc(`Polls/${pollID}`)),
    removeDocument(db.doc(`Results/${pollID}`))
  ]);
}

function acceptPoll(pollID, title, answers) {
  return admin.firestore()
    .doc(`Polls/${pollID}`)
    .update({ title, answers, pending: false });
}

function removeDocument(ref) {
  const db = admin.firestore();
  return db.runTransaction(t => {
    return ref.getCollections()
      .then(collections => {
        return Promise.all(collections.map(collection => collection.get()))
      })
      .then(collections => {
        const deletes = [];
        for (const collection of collections)
          deletes.concat(collection.docs.map(doc => removeDocument(doc.ref)));
        return Promise.all(deletes);
      })
      .then(() => t.delete(ref));
  })
}

module.exports = { removePoll, acceptPoll };