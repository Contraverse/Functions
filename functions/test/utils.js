const admin = require('firebase-admin');

function removeDocument(ref) {
  const db = admin.firestore();
  return db.runTransaction(t => {
    return ref.getCollections()
      .then(collections => {
        return Promise.all(collections.map(collection => collection.get()))
          .then(collections => {
            const deletes = [];
            for(const collection of collections)
              deletes.concat(collection.docs.map(doc => removeDocument(doc.ref)));
            return Promise.all(deletes);
          })
      })
      .then(() => t.delete(ref));
  })
}

function removePoll(pollID) {
  const db = admin.firestore();
  const pollRef = db.doc(`Polls/${pollID}`);
  const resultsRef = db.doc(`Results/${pollID}`);
  return Promise.all([
    removeDocument(pollRef),
    removeDocument(resultsRef)
  ]);
}

function removeUser(userID) {
  const db = admin.firestore();
  const userRef = db.doc(`Profiles/${userID}`);
  return removeDocument(userRef);
}

module.exports = { removePoll, removeUser, removeDocument };