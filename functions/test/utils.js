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

function createDocument() {
  const db = admin.firestore();
  const data = { test: true };

  if (arguments.length === 1) {
    const path = arguments[0];
    const ref = db.doc(path);
    return ref.set(data);
  }

  if (arguments.length === 2) {
    const batch = arguments[0];
    const path = arguments[1];

    const ref = db.doc(path);
    return batch.set(ref, data);
  }
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

function generateAuthHeader(userID) {
  return `Bearer ${userID}`;
}

module.exports = { createDocument, removePoll, removeUser, removeDocument, generateAuthHeader };