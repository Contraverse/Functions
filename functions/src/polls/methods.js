const admin = require('firebase-admin');

function getPolls() {
  const db = admin.firestore();
  return db.collection('Polls')
    .where('pending', '==', false).orderBy('dateCreated', 'desc')
    .get()
    .then(snapshot => {
      return snapshot.docs.map(doc => {
        const { title, answers, dateCreated } = doc.data();
        return {
          docID: doc.id,
          question: title,
          answers,
          dateCreated
        }
      });
    });
}

function createPoll(question, answers, pending = true) {
  const db = admin.firestore();
  const pollRef = db.collection('Polls').doc();
  const resultsRef = db.doc(`Results/${pollRef.id}`);
  const batch = db.batch();
  batch.set(pollRef, {
    title: question,
    pending,
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
  return db.runTransaction(t => {
    return t.get(votesRef).then(doc => {
      const totalVotes = doc.data();
      totalVotes.counts[answer]++;

      t.update(votesRef, totalVotes);
      t.set(userRef.collection('Polls').doc(pollID), { answer });
      return totalVotes;
    })
  })
}

function clearVote(userID, pollID) {
  const db = admin.firestore();
  const votesRef = db.doc(`Profiles/${userID}/Polls/${pollID}`);
  const resultsRef = db.doc(`Results/${pollID}`);

  return db.runTransaction(t => {
    return t.getAll(votesRef, resultsRef)
      .then(([votesDoc, resultsDoc]) => {
        const totalVotes = resultsDoc.data();
        const { answer } = votesDoc.data();
        totalVotes.counts[answer]--;

        t.delete(votesRef);
        t.set(resultsRef, totalVotes);
        return answer;
      })
  })
}

module.exports = { getPolls, createPoll, castVote, clearVote };