const admin = require('firebase-admin');

function feedback(req, res) {
  const { message } = req.body;
  if(message === undefined)
    return res.status(400).send('No message');
  return sendFeedback(message)
    .then(res.status(200).send('OK'));
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

module.exports = { feedback, sendFeedback };