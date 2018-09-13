const { body, validationResult } = require('express-validator/check');
const admin = require('firebase-admin');

function handler(app) {
  app.post('/feedback',
    body('message').exists(),
    (req, res) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(422).json({ errors: errors.array() });
      }

      const { message } = req.body;
      return sendFeedback(message)
        .then(() => res.status(200).send('OK'));
    })
}

function sendFeedback(message) {
  const storageRef = admin.storage().ref();
  const uid = createUID();
  const fileRef = storageRef.child(`feedback/${uid}.txt`);
  return fileRef.putString(message)
    .then(() => uid);
}

function createUID() {
  return Math.floor((1 + Math.random()) * 0x1000000000000)
    .toString(16)
    .substring(1);
}

module.exports = handler;