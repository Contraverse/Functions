const admin = require('firebase-admin');

function spectate(req, res) {
  const { userID } = req.query;
  if (userID === undefined)
    return res.status(400).send('No user ID');
  if (req.method === 'GET') {
    const { pollID } = req.query;
    if (pollID === undefined)
      return res.status(400).send('No poll ID');

    return getSpectate(userID, pollID)
      .then(result => {
        if (result)
          return res.status(200).send(result);
        return res.status(204).send('Spectate not found');
      });
  }
  const { chatID } = req.body;
  return setSpectate(userID, chatID)
    .then(() => res.status(200).send('OK'));
}

function getSpectate(userID, pollID) {
  const db = admin.firestore();
  const query = db.collection('Debates').where('pollID', '==', pollID);
  return query.get().then(snapshot => {
    const debates = snapshot.docs;
    if (debates.length === 0) {
      return null;
    }
    const chat = debates[Math.floor(Math.random() * debates.length)];
    return chat.id;
  });
}

function setSpectate(userID, chatID) {
  return admin.firestore()
    .doc(`Profiles/${userID}/Spectates/${chatID}`)
    .set({ active: true });
}

module.exports = { findSpectate: spectate, getSpectate, setSpectate };