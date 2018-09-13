const admin = require('firebase-admin');

function getPolls() {
  const db = admin.firestore();
  return db.collection('Polls')
    .where('pending', '==', false).orderBy('dateCreated')
    .get()
    .then(snapshot => {
      return snapshot.docs.map(doc => {
        const { title, answers } = doc.data();
        return {
          docID: doc.id,
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

function castVote(userID, pollID, answer) {
  const db = admin.firestore();
  const userRef = db.doc(`Profiles/${userID}`);
  const votesRef = db.doc(`Results/${pollID}`);
  let totalVotes;
  return db.runTransaction(t => {
    return t.get(votesRef).then(doc => {
      totalVotes = doc.data();
      totalVotes.counts[answer]++;

      return Promise.all([
        t.update(votesRef, totalVotes),
        t.set(userRef.collection('Polls').doc(pollID), { answer })
      ]);
    }).then(() => totalVotes)
  })
}

module.exports = { getPolls, createPoll, castVote };