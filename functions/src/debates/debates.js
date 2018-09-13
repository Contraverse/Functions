const admin = require('firebase-admin');
const { settings } = require('../../config/firebase');
const { getDocuments } = require('../utils/snapshot');

function getDebates(userID) {
  const db = admin.firestore();
  db.settings(settings);
  return db.collection('Debates').where(`users.${userID}`, '==', true)
    .then(snapshot => getDocuments(snapshot));
}

// TODO: Only works for 2 answer choices. Make more general
function findDebate(userID, pollID, category) {
  const opponentCategory = category ^ 1;
  const db = admin.firestore();
  const queueRef = db.collection(`Polls/${pollID}/Queue${category}`);
  const opponentRef = db.collection(`Polls/${pollID}/Queue${opponentCategory}`)
    .orderBy('dateCreated')
    .limit(1);

  return db.runTransaction(t => {
    let response = null;
    return t.get(opponentRef).then(snapshot => {
      if (!snapshot.empty) {
        const doc = snapshot.docs[0];
        response = { found: true, opponentID: doc.id };
        return setupChatroom(t, db, userID, doc.id, pollID, response)
          .then(() => t.delete(doc.ref));
      }
      else {
        response = { found: false };
        return t.set(queueRef.doc(userID), {
          dateCreated: admin.firestore.FieldValue.serverTimestamp()
        });
      }
    }).then(() => response);
  })
}

function setupChatroom(t, db, userID, opponentID, pollID, response) {
  const profiles = db.collection('Profiles');
  const userRef = profiles.doc(userID);
  const opponentRef = profiles.doc(opponentID);

  return Promise.all([
    t.get(userRef),
    t.get(opponentRef)
  ]).then(([user, opponent]) => {
    const debate = {
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      lastMessage: "New Debate!",
      pollID,
      users: {
        [userID]: user.data(),
        [opponentID]: opponent.data()
      }
    };
    const ref = db.collection('Debates').doc();
    response.chatID = ref.id;
    return t.set(ref, debate);
  })
}

module.exports = { getDebates, findDebate, setupChatroom };