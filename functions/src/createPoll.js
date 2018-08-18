const admin = require('firebase-admin');

function _createPoll(question, answers) {
  const db = admin.firestore();
  const pollRef = db.collection('Polls').doc();
  const resultsRef = db.doc(`Results/${pollRef.id}`);
  const batch = db.batch();
  batch.set(pollRef, {
    title: question,
    pending: true,
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
  if(question === undefined)
    return res.status(400).send('No question');
  if(answers === undefined)
    return res.status(400).send('No answers');

  return _createPoll(question, answers)
    .then(pollID => res.status(200).send(pollID));
}

module.exports = { createPoll, _createPoll };