const admin = require('firebase-admin');
const { getDocument } = require('./utils/document');

function debate(req, res) {
  const { debateID } = req.query;
  if (debateID === undefined) {
    return res.status(400).send('No Debate ID')
  }

  if(req.method === 'GET') {
    return getDebate(debateID)
      .then(result => res.status(200).send(result));
  }

  if(req.method === 'DELETE') {
    const { userID } = req.query;
    return leaveDebate(userID, debateID);
  }
}

function getDebate(debateID) {
  const db = admin.firestore();
  return db.doc(`Debates/${debateID}`).get()
    .then(doc => getDocument(doc));
}

function leaveDebate(userID, debateID) {
  const db = admin.firestore();
  return db.runTransaction(t => {
    const debateRef = db.doc(`Debates/${debateID}`);
    let debate = null;
    return t.get(debateRef).then(doc => {
      debate = doc.data();
      debate.users[userID] = false;
      if (isActive(debate.users)) {
        return t.update(debateRef, debate);
      }
      else {
        return deleteDebate(t, debateRef);
      }
    })
  })
}

function deleteDebate(t, ref) {
  return t.get(ref.collection('Messages')).then(snapshot => {
    return Promise.all(snapshot.docs.map(doc => t.delete(doc.ref)))
  }).then(() => t.delete(ref))
}

function isActive(users) {
  return Object.keys(users).some(userID => users[userID])
}


module.exports = { debate, getDebate, leaveDebate };