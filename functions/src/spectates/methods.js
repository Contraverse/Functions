const admin = require('firebase-admin');

function getSpectate(userID, pollID) {
  const db = admin.firestore();
  const query = db.collection('Debates').where('pollID', '==', pollID);
  return query.get().then(snapshot => {
    const debates = snapshot.docs
      .filter(doc => !(userID in doc.data().users));

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

function removeSpectate(userID, chatID) {
  return admin.firestore()
    .doc(`Profiles/${userID}/Spectates/${chatID}`)
    .delete();
}

module.exports = { getSpectate, setSpectate, removeSpectate };