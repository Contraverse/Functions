const admin = require('firebase-admin');

function getSpectate(userID, pollID) {
  const db = admin.firestore();
  const query = db.collection('Debates').where('pollID', '==', pollID);
  return query.get().then(snapshot => {
    const debates = snapshot.docs
      .filter(doc => isGoodSpectate(doc.data(), userID));

    if (debates.length === 0) {
      return null;
    }

    const chat = debates[Math.floor(Math.random() * debates.length)];
    return chat.id;
  });
}

function isGoodSpectate(spectate, userID) {
  return spectate.users &&
    !(userID in spectate.users) &&
    spectate.lastMessage &&
    spectate.lastMessage !== 'New Debate!';
}

function setSpectate(userID, chatID) {
  return admin.firestore()
    .doc(`Profiles/${userID}/Spectates/${chatID}`)
    .set({ active: true });
}

function removeSpectate(userID, chatID) {
  return admin.firestore()
    .doc(`Profiles/${userID}/Spectates/${chatID}`)
    .delete();
}

module.exports = { getSpectate, setSpectate, removeSpectate };