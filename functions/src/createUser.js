const admin = require('firebase-admin');

function _createUser(userID, avatar, gender, username) {
  const db = admin.firestore();
  return db.doc(`Profiles/${userID}`).set({
    avatar,
    gender,
    username
  });
}

function createUser(req, res) {
  const { userID, avatar, gender, username } = req.body;
  return _createUser(userID, avatar, gender, username)
    .then(() => res.send('OK'));
}

module.exports = { createUser, _createUser };