const admin = require('firebase-admin');

function findDebate(req, res) {
  const { userID, pollID, category } = req.body;
  return _findDebate(userID, pollID, category)
    .then(result => res.send(JSON.stringify(result)));
}

// TODO: Only works for 2 answer choices. Make more general
function _findDebate(userID, pollID, category) {
  const opponentCategory = category ^ 1;
  const db = admin.firestore();
  const queueRef = db.collection(`Polls/${pollID}/Queue${category}`);
  const opponentRef = db.collection(`Polls/${pollID}/Queue${opponentCategory}`).orderBy('dateCreated').limit(1);
  return db.runTransaction(t => {
    let response = null;
    return t.get(opponentRef).then(snapshot => {
      if (!snapshot.empty) {
        const doc = snapshot.docs[0];
        const opponentID = doc.id;
        response = { found: true, opponentID };
        return Promise.all([
          t.delete(doc.ref),
          setupChatroom(t, db, userID, opponentID, pollID)
        ]);
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

function setupChatroom(t, db, userID, opponentID, pollID) {
  const debate = {
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    lastMessage: "New Debate!",
    pollID,
    users: {
      [userID]: true,
      [opponentID]: true
    }
  };
  const ref = db.collection('Debates').doc();
  return t.set(ref, debate);
}

module.exports = { findDebate, _findDebate };