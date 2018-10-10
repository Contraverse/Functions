const admin = require('firebase-admin');

function sendNotification(chatID, userID, pollID, { deliverNotification = sendFCMNotification }) {
  const db = admin.firestore();
  const userRef = db.doc(`Profiles/${userID}`);
  const notificationsRef = db.doc(`Profiles/${userID}/Notifications/${chatID}`);
  const pollRef = db.doc(`Polls/${pollID}`);
  const tokenRef = db.doc(`Tokens/${userID}`);

  return db.runTransaction(t => {
    return t.getAll(userRef, notificationsRef, pollRef, tokenRef)
      .then(([userDoc, notificationsCountDoc, poll, tokenDoc]) => {
        const user = userDoc.data();
        const { token } = tokenDoc.data();
        const debateNotificationCount = getNotificationCount(notificationsCountDoc) + 1;

        const totalNotificationCount = (user.notifications || 0) + 1;
        setNotificationCount(t, userRef, notificationsRef, totalNotificationCount, debateNotificationCount);

        const message = createNotification(chatID, user, poll.data(), token, totalNotificationCount);
        return deliverNotification(message);
      })
  })
}

function sendFCMNotification(message) {
  return admin.messaging().send(message);
}

function getNotificationCount(notificationsDoc) {
  if (notificationsDoc.exists)
    return notificationsDoc.data().count;
  return 0;
}

function setNotificationCount(t, userRef, notificationsRef, totalNotificationCount, debateNotificationCount) {
  t.update(userRef, { notifications: totalNotificationCount });
  t.set(notificationsRef, { count: debateNotificationCount });
}

function createNotification(chatID, user, poll, token, notificationCount) {
  const data = {
    type: 'debate',
    debateId: chatID,
    pollQuestion: poll.title
  };

  const notification = {
    title: 'Debate Found!',
    body: `Starting Debate with ${user.username}`
  };

  const apns = {
    payload: {
      aps: {
        badge: notificationCount,
      }
    }
  };

  console.log('Notification', notification, apns, data, token);
  return { notification, apns, data, token };
}

module.exports = { sendNotification };