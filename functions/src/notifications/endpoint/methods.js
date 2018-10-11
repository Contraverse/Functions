const admin = require('firebase-admin');

function clearNotifications(docID, userID) {
  const db = admin.firestore();
  const userRef = db.doc(`Profiles/${userID}`);
  const notificationsRef = db.doc(`Profiles/${userID}/Notifications/${docID}`);
  return db.runTransaction(t => {
    return t.getAll(userRef, notificationsRef)
      .then(([user, notifications]) => {
        t.delete(notificationsRef);
        const newNotificationCount = user.data().notifications - notifications.data().count;
        return t.update(userRef, { notifications: newNotificationCount });
      })
  })
}

module.exports = { clearNotifications };