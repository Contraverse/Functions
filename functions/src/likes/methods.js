const admin = require('firebase-admin');

function like(userID, debateID, messageID) {
  const db = admin.firestore();
  const messageRef = getMessageRef(debateID, messageID);
  const likeRef = messageRef.collection('Likes').doc(userID);
  return db.runTransaction(t => {
    return t.get(messageRef)
      .then(doc => {
        const message = doc.data();
        message.likes = (message.likes || 0) + 1;
        t.set(messageRef, message);
        t.set(likeRef, { active: true });
        return message.likes;
      })
  })
}

function dislike(userID, debateID, messageID) {
  const db = admin.firestore();
  const messageRef = getMessageRef(debateID, messageID);
  const likeRef = messageRef.collection('Likes').doc(userID);
  return db.runTransaction(t => {
    return t.get(messageRef)
      .then(doc => {
        const message = doc.data();
        message.likes = Math.max(0, (message.likes || 0) - 1);
        t.set(messageRef, message);
        t.delete(likeRef);
        return message.likes;
      })
  })
}

function getMessageRef(debateID, messageID) {
  return admin.firestore()
    .doc(`Debates/${debateID}/Messages/${messageID}`);
}

module.exports = { like, dislike };