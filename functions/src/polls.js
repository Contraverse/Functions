const admin = require('firebase-admin');

function polls(req, res) {
  if(req.method === 'GET') {
    return getPolls()
      .then(result => res.status(200).send(result));
  }
  if(req.method === 'POST') {
    const { question, answers } = req.body;
    if(question === undefined)
      return res.status(400).send('No question');
    if(answers === undefined)
      return res.status(400).send('No answers');

    return createPoll(question, answers)
      .then(pollID => res.status(200).send(pollID));
  }

  return res.status(400).send('Invalid Status Code');
}

function getPolls() {
  const db = admin.firestore();
  return db.collection('Polls')
    .where('pending', '==', false)
    .orderBy('dateCreated')
    .get()
    .then(snapshot => {
      return snapshot.docs.map(doc => {
        const { title, answers } = doc.data();
        return {
          id: doc.id,
          question: title,
          answers
        }
      });
    });
}

function createPoll(question, answers) {
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

module.exports = { polls, getPolls };