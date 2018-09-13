const admin = require('firebase-admin');
const { getDocument } = require('../utils/document');

function getDebate(debateID) {
  const db = admin.firestore();
  return db.doc(`Debates/${debateID}`).get()
    .then(doc => getDocument(doc));
}

function leaveDebate(userID, debateID) {
  const db = admin.firestore();
  return db.runTransaction(t => {
    const debateRef = db.doc(`Debates/${debateID}`);
    let debate = null;
    return t.get(debateRef).then(doc => {
      debate = doc.data();
      delete debate.users[userID];
      if (isActive(debate.users)) {
        return t.update(debateRef, debate);
      }
      else {
        return deleteDebate(t, debateRef);
      }
    })
  })
}

function deleteDebate(t, ref) {
  return t.get(ref.collection('Messages')).then(snapshot => {
    return Promise.all(snapshot.docs.map(doc => t.delete(doc.ref)))
  }).then(() => t.delete(ref))
}

function isActive(users) {
  return Object.keys(users).length > 0;
}

module.exports = { getDebate, leaveDebate };