const admin = require('firebase-admin');

function findSpectate(req, res) {
  const { userID, pollID } = req.body;
  return _findSpectate(userID, pollID)
    .then(result => res.send(JSON.stringify(result)));
}

function _findSpectate(userID, pollID) {
  const db = admin.firestore();
  const query = db.collection('Debates').where('pollID', '==', pollID);
  let response = null;
  let chatID = null;
  return query.get().then(snapshot => {
    const debates = snapshot.docs.map(({ id }) => id);
    if (debates.length === 0) {
      response = { found: false };
      return false;
    }
    chatID = debates[Math.floor(Math.random() * debates.length)];
    response = { found: true, chatID };
    return db.doc(`Profiles/${userID}/Spectates/${chatID}`).set({ active: true });
  }).then(() => response);
}

module.exports = { findSpectate, _findSpectate };