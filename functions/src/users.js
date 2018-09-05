const admin = require('firebase-admin');

function users(req, res) {
  const { userID, avatar, username } = req.body;
  if(userID === undefined)
    return res.status(400).send('No user ID');

  if(req.method === 'POST') {
    if(avatar === undefined)
      return res.status(400).send('No avatar');
    if(username === undefined)
      return res.status(400).send('No username');

    return createUser(userID, avatar, username)
      .then(() => res.status(200).send('OK'));
  }

  if(req.method === 'PUT') {
    return updateUser(userID, avatar, username)
      .then(() => res.status(200).send('OK'));
  }

  return res.status(400).send('Invalid Request Method');
}

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
  if(avatar !== undefined)
    doc.avatar = avatar;
  if(username !== undefined)
    doc.username = username;

  return db.doc(`Profiles/${userID}`).update(doc)
}

module.exports = { users, createUser, updateUser };