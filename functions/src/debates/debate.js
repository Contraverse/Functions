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
      debate.users[userID].active = false;
      if (isActive(debate.users)) {
        t.update(debateRef, debate);
        return generateSystemLeaveMessage(userID)
          .then(message => t.set(debateRef.collection('Messages').doc(), message));
      }
      else {
        return deleteDebate(t, debateRef);
      }
    })
  })
}

function deleteDebate(t, ref) {
  return t.get(ref.collection('Messages'))
    .then(snapshot => {
      snapshot.docs.forEach(doc => t.delete(doc.ref));
      t.delete(ref);
    });
}

function generateSystemLeaveMessage(userID) {
  const db = admin.firestore();
  return db.doc(`Profiles/${userID}`).get()
    .then(doc => {
      const { username } = doc.data();
      return {
        text: `${username} has left the debate`,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        system: true
      }
    })
}

function isActive(users) {
  for (const userID in users) {
    if (users[userID].active)
      return true;
  }
  return false;
}

module.exports = { getDebate, leaveDebate };