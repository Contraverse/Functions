const admin = require('firebase-admin');

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

function polls(req, res) {
  return getPolls()
    .then(result => res.status(200).send(result));
}

module.exports = { polls, getPolls };