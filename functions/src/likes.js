const admin = require('firebase-admin');
const { param, query, validationResult } = require('express-validator/check');

function handler(app) {
  app.post('/debates/:debateID/likes', [
    param('debateID').exists(),
    query('messageID').exists()
  ], (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    }

    const { debateID } = req.params;
    const { messageID } = req.query;
    return likeMessage(debateID, messageID)
      .then(() => res.status(200).send('OK'));
  })
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

module.exports = handler;

