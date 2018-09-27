const admin = require('firebase-admin');

function isValidDebate(chatID) {
  const db = admin.firestore();
  return db.doc(`Debates/${chatID}`)
    .get()
    .then(doc => doc.exists);
}

module.exports = { isValidDebate };