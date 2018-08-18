const firebase = require('firebase-admin');

function castVote(req, res) {
  const { userID, pollID, answer } = req.body;
  if(userID === undefined)
    return res.status(400).send('No user ID');
  if(pollID === undefined)
    return res.status(400).send('No poll ID');
  if(answer === undefined)
    return res.status(400).send('No answer');

  return _castVote(userID, pollID, answer)
    .then(result => res.status(200).send(result));
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