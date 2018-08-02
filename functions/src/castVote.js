const firebase = require('firebase-admin');

function castVote(req, res) {
  const { userID, pollID, answer } = req.body;
  return _castVote(userID, pollID, answer)
    .then(res.send('OK'));

}

function _castVote(userID, pollID, answer) {
  const db = firebase.firestore();
  const userRef = db.doc(`Profiles/${userID}`);
  const resultsRef = db.collection(`Polls/${pollID}/Results`);
  const totalVotesRef = resultsRef.doc('totalVotes');
  const genderVotesRef = resultsRef.doc('genderVotes');
  return db.runTransaction(t => {
    let user = null;
    let totalVotes = null;
    let genderVotes = null;
    return t.get(userRef).then(doc => {
      user = doc.data();
      return Promise.all([
        t.get(totalVotesRef),
        t.get(genderVotesRef)]);
    }).then(docs => {
      totalVotes = docs[0].data();
      genderVotes = docs[1].data();

      totalVotes.counts[answer]++;
      genderVotes[user.gender][answer]++;

      return Promise.all([
        t.update(totalVotesRef, totalVotes),
        t.update(genderVotesRef, genderVotes),
        t.set(userRef.collection('Polls').doc(pollID), { answer })]);
    })
  })
}

module.exports = { castVote, _castVote };