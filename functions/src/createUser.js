const admin = require('firebase-admin');

function _createUser(userID, avatar, username) {
  const db = admin.firestore();
  return db.doc(`Profiles/${userID}`).set({
    avatar,
    username
  });
}

function createUser(req, res) {
  const { userID, avatar, username } = req.body;
  if(userID === undefined)
    return res.status(400).send('No user ID');
  if(avatar === undefined)
    return res.status(400).send('No avatar');
  if(username === undefined)
    return res.status(400).send('No username');

  return _createUser(userID, avatar, username)
    .then(() => res.status(200).send('OK'));
}

module.exports = { createUser, _createUser };