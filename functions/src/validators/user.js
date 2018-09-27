const admin = require('firebase-admin');

function isValidUser(userID) {
  const db = admin.firestore();
  return db.doc(`Profiles/${userID}`)
    .get()
    .then(doc => doc.exists);
}

module.exports = { isValidUser };