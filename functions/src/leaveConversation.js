const admin = require('firebase-admin');

module.exports = function (req, res) {
  const { userID, debateID } = req.body;
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
    }).then(() => {
      return res.send('OK');
    });
  })
};

function deleteDebate(t, ref) {
  return t.get(ref.collection('Messages')).then(snapshot => {
    return Promise.all(snapshot.docs.map(doc => {
      return t.delete(doc.ref);
    }))
  }).then(() => {
    return t.delete(ref);
  })
}

function isActive(users) {
  return Object.keys(users).some(userID => {
    return users[userID];
  })
}