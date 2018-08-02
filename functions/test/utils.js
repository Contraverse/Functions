const admin = require('firebase-admin');

function removePoll(pollID) {
  const db = admin.firestore();
  const pollRef = db.doc(`Polls/${pollID}`);
  const queueRef = pollRef.collection('Queues');
  const resultsRef = pollRef.collection('Results');
  return db.runTransaction(t => {
    return Promise.all([
      t.get(queueRef),
      t.get(resultsRef)
    ]).then(docs => {
      const resultDeletes = docs[0].docs.map(doc => t.delete(doc.ref));
      const queueDeletes = docs[1].docs.map(doc => t.delete(doc.ref));
      return Promise.all(resultDeletes.concat(queueDeletes));
    }).then(() => {
      return t.delete(pollRef);
    });
  });
}

function removeUser(userID) {
  const db = admin.firestore();
  const userRef = db.doc(`Profiles/${userID}`);
  const spectatesRef = userRef.collection('Spectates');
  const pollsRef = userRef.collection('Polls');
  return db.runTransaction(t => {
    return Promise.all([
      t.get(spectatesRef),
      t.get(pollsRef)
    ]).then(docs => {
      const spectateDeletes = docs[0].docs.map(doc => t.delete(doc.ref));
      const pollDeletes = docs[1].docs.map(doc => t.delete(doc.ref));
      return Promise.all(spectateDeletes.concat(pollDeletes));
    }).then(() => {
      return t.delete(userRef);
    });
  });
}

module.exports = { removePoll, removeUser };