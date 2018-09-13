const admin = require('firebase-admin');

function createUser(userID, avatar, username) {
  const db = admin.firestore();
  return db.doc(`Profiles/${userID}`).set({
    avatar,
    username
  });
}

function updateUser(userID, avatar, username) {
  const db = admin.firestore();
  const doc = {};
  if (avatar !== undefined)
    doc.avatar = avatar;
  if (username !== undefined)
    doc.username = username;

  return db.doc(`Profiles/${userID}`).update(doc)
}

module.exports = { createUser, updateUser };