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
    return t.get(opponentRef).then(snapshot => {
      if (!snapshot.empty) {
        const doc = snapshot.docs[0];
        const opponentID = doc.id;
        return setupChatroom(t, db, userID, opponentID, pollID)
          .then(chatID => {
            t.delete(doc.ref);
            return { found: true, opponentID, chatID };
          });
      }
      else {
        t.set(queueRef.doc(userID), {
          dateCreated: admin.firestore.FieldValue.serverTimestamp()
        });
        return { found: false };
      }
    });
  })
}

function setupChatroom(t, db, userID, opponentID, pollID) {
  const profiles = db.collection('Profiles');
  const userRef = profiles.doc(userID);
  const opponentRef = profiles.doc(opponentID);

  return t.getAll(userRef, opponentRef).then(([user, opponent]) => {
    const debate = createDebateDoc(pollID, user, opponent);

    const ref = db.collection('Debates').doc();
    t.set(ref, debate);
    return ref.id;
  })
}

function createDebateDoc(pollID, user, opponent) {
  const users = {
    [user.id]: createUserDoc(user),
    [opponent.id]: createUserDoc(opponent)
  };

  return {
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    lastMessage: 'New Debate!',
    pollID,
    users
  };
}

function createUserDoc(user) {
  const { avatar, username } = user.data();
  return {
    active: true,
    update: true,
    avatar,
    username,
  }
}

module.exports = { getDebates, findDebate, setupChatroom };