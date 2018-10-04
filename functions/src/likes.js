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
    return updateLikes(debateID, messageID, 1)
      .then(likes => res.status(200).json({ likes }));
  });

  app.delete('/debates/:debateID/likes', [
    param('debateID').exists(),
    query('messageID').exists()
  ], (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    }

    const { debateID } = req.params;
    const { messageID } = req.query;
    return updateLikes(debateID, messageID, -1)
      .then(likes => res.status(200).json({ likes }));
  })
}

function updateLikes(debateID, messageID, amount) {
  const db = admin.firestore();
  const messageRef = db.doc(`Debates/${debateID}/Messages/${messageID}`);
  return db.runTransaction(t => {
    return t.get(messageRef)
      .then(doc => {
        const message = doc.data();
        message.likes = (message.likes || 0) + amount;
        t.set(messageRef, message);
        return message.likes;
      })
  })
}

module.exports = handler;

