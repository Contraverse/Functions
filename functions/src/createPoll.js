const admin = require('firebase-admin');

function _createPoll(question, answers) {
  const db = admin.firestore();
  const pollRef = db.collection('Polls').doc();
  const queueRef = pollRef.collection('Queues');
  const resultsRef = pollRef.collection('Results');
  const batch = db.batch();
  batch.set(pollRef, {
    title: question,
    answers,
    dateCreated: admin.firestore.FieldValue.serverTimestamp()
  });
  for (let i = 0; i < answers.length; i++)
    batch.set(queueRef.doc(i.toString()), {})
  batch.set(resultsRef.doc('totalVotes'), {
    counts: Array(answers.length).fill(0)
  });
  batch.set(resultsRef.doc('genderVotes'), {
    female: Array(answers.length).fill(0),
    male: Array(answers.length).fill(0)
  });
  return batch.commit().then(() => pollRef.id);
}

function createPoll(req, res) {
  const { question, answers } = req.body;
  return _createPoll(question, answers)
    .then(pollID => res.send(pollID));
}

module.exports = { createPoll, _createPoll };