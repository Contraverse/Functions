const admin = require('firebase-admin');

function likes(req, res) {
  const { debateID, messageID } = req.query;
  if(debateID === undefined)
    return res.status(400).send('No debate ID');
  if(messageID === undefined)
    return res.status(400).send('No message ID');
  return likeMessage(debateID, messageID)
    .then(() => res.status(200).send('OK'))
}

function likeMessage(debateID, messageID) {
  const db = admin.firestore();
  const messageRef = db.doc(`Debates/${debateID}/Messages/${messageID}`);
  return db.runTransaction(t => {
    return t.get(messageRef)
      .then(doc => {
        const message = doc.data();
        message.likes = (message.likes || 0) + 1;
        return t.set(messageRef, message);
      })
  })
}

module.exports = { likes, likeMessage };

