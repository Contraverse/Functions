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

function getRandomAvatar() {
  const db = admin.firestore();
  const ref = db.collection('Avatars');
  return ref.get()
    .then(snapshot => {
      const avatars = snapshot.docs;
      const index = Math.floor(Math.random() * avatars.length);

      return avatars[index].data().source;
    })
}

function updateToken(userID, token) {
  return admin.firestore()
    .doc(`Tokens/${userID}`)
    .set({ token });
}

function deleteToken(userID) {
  return admin.firestore()
    .doc(`Tokens/${userID}`)
    .delete()
}

module.exports = { createUser, updateUser, getRandomAvatar, updateToken, deleteToken };