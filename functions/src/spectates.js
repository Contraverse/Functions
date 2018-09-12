const admin = require('firebase-admin');
const { getDocuments } = require('./utils/snapshot');
function spectates(req, res) {
  const { userID } = req.query;
  return getSpectates(userID)
    .then(result => res.status(200).send(result))
}

function getSpectates(userID) {
  const db = admin.firestore();
  return db.collection(`Profiles/${userID}/Spectates`).get()
    .then(snapshot => getDocuments(snapshot))
}

module.exports = { spectates, getSpectates };