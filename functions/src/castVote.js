const firebase = require('firebase-admin');

function castVote(req, res) {
  const { userID, pollID, answer } = req.body;
  return _castVote(userID, pollID, answer)
    .then(result => res.send(result));
}

function _castVote(userID, pollID, answer) {
  const db = firebase.firestore();
  const userRef = db.doc(`Profiles/${userID}`);
  const votesRef = db.doc(`Results/${pollID}`);
  let totalVotes;
  return db.runTransaction(t => {
    return t.get(votesRef).then(doc => {
      totalVotes = doc.data();
      totalVotes.counts[answer]++;

      return Promise.all([
        t.update(votesRef, totalVotes),
        t.set(userRef.collection('Polls').doc(pollID), { answer })]);
    }).then(() => totalVotes)
  })
}

module.exports = { castVote, _castVote };