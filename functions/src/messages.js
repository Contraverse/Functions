const admin = require('firebase-admin');
const { param, body, validationResult } = require('express-validator/check');

function handler(app) {
  app.post('/debates/:debateID/messages', [
    param('debateID').exists(),
    body('messages').exists()
      .customSanitizer(messages => formatMessages(messages))
  ], (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).send(errors.array());
    }

    const { debateID } = req.params;
    const { messages } = req.body;

    return sendMessages(debateID, messages)
      .then(() => res.status(200).send('OK'));
  })
}

function sendMessages(debateID, messages) {
  const db = admin.firestore();
  const batch = db.batch();
  const chatRef = db.doc(`Debates/${debateID}`);
  const messagesRef = chatRef.collection('Messages');
  messages.forEach(message => {
    message.likes = 0;
    batch.set(messagesRef.doc(), message);
  });
  batch.update(chatRef, { lastMessage: messages[messages.length - 1].text });
  return batch.commit();
}

function formatMessages(messages) {
  if(messages === undefined || messages === null)
    return [];
  if(messages.constructor === Array)
    return messages;
  return [messages];
}

module.exports = handler;