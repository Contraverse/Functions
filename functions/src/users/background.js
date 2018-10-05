const admin = require('firebase-admin');

function updateUserDocsInDebates(app) {
  return app.document('Profiles/{userID}')
    .onUpdate((change, context) => {
      const { userID } = context.params;
      const newUser = change.after.data();
      return _updateUserDocsInDebates(userID, newUser)
    })
}

function _updateUserDocsInDebates(userID, newUser) {
  const db = admin.firestore();
  const query = db.collection('Debates')
    .where(`users.${userID}.update`, '==', true);

  return query.get()
    .then(snapshot => {
      const batch = db.batch();
      for (const doc of snapshot.docs) {
        const debate = doc.data();
        debate.users[userID] = newUser;
        batch.update(doc.ref, debate);
      }
      return batch.commit();
    })
}

module.exports = {
  updateUserDocsInDebates,
  helpers: {
    _updateUserDocsInDebates
  }
};