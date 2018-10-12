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
        batch.update(doc.ref, {
          [`users.${userID}.username`]: newUser.username,
          [`users.${userID}.avatar`]: newUser.avatar
        });
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