const admin = require('firebase-admin');

function isValidDebate(chatID) {
  return getDebate(chatID)
    .then(doc => doc.exists);
}

function isValidAnswer(answer, { req }) {
  const { pollID } = req.query;
  return admin.firestore()
    .doc(`Polls/${pollID}`)
    .get()
    .then(doc => {
      return answer < doc.data().answers.length;
    });
}

function getDebate(debateID) {
  return admin.firestore()
    .doc(`Debates/${debateID}`)
    .get();
}

module.exports = { isValidDebate, isValidAnswer };