const admin = require('firebase-admin');

function isValidPoll(pollID) {
  const db = admin.firestore();
  return db.doc(`Polls/${pollID}`)
    .get()
    .then(doc => doc.exists);
}

module.exports = { isValidPoll };