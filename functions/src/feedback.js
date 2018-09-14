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
        .then(uid => res.status(200).json({ uid }));
    })
}

function sendFeedback(message) {
  const bucket = admin.storage().bucket();
  const uid = createUID();
  const fileRef = bucket.file(`feedback/${uid}.txt`);
  return fileRef.save(message)
    .then(() => uid);
}

function createUID() {
  return Math.floor((1 + Math.random()) * 0x1000000000000)
    .toString(16)
    .substring(1);
}

module.exports = handler;