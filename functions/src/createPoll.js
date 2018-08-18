const admin = require('firebase-admin');

function _createPoll(question, answers) {
  const db = admin.firestore();
  const pollRef = db.collection('Polls').doc();
  const resultsRef = db.doc(`Results/${pollRef.id}`);
  const batch = db.batch();
  batch.set(pollRef, {
    title: question,
    answers,
    dateCreated: admin.firestore.FieldValue.serverTimestamp()
  });
  batch.set(resultsRef, {
    counts: Array(answers.length).fill(0)
  });
  return batch.commit().then(() => pollRef.id);
}

function createPoll(req, res) {
  const { question, answers } = req.body;
  return _createPoll(question, answers)
    .then(pollID => res.send(pollID));
}

module.exports = { createPoll, _createPoll };