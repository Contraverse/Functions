const admin = require('firebase-admin');

function hasVoted(req, res, next) {
  const db = admin.firestore();
  const { pollID } = req.params;
  const { userID } = req;

  const votesDoc = db.doc(`Profiles/${userID}/Polls/${pollID}`);
  return votesDoc.get()
    .then(doc => {
      if (doc.exists) {
        return next();
      }
      return res.status(403).send('User has not cast a vote');
    })
}

module.exports = { hasVoted };