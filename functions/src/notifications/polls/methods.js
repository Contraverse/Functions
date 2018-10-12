const admin = require('firebase-admin');
const { sendFCMNotification, getNotificationCount, setNotificationCount } = require('../utils');

function sendNotification(chatID, userID, pollID, { deliverNotification = sendFCMNotification } = {}) {
  const db = admin.firestore();
  const userRef = db.doc(`Profiles/${userID}`);
  const notificationsRef = db.doc(`Profiles/${userID}/Notifications/${pollID}`);
  const pollRef = db.doc(`Polls/${pollID}`);
  const tokenRef = db.doc(`Tokens/${userID}`);

  return db.runTransaction(t => {
    return t.getAll(userRef, notificationsRef, pollRef, tokenRef)
      .then(([userDoc, notificationsCountDoc, poll, tokenDoc]) => {
        const user = userDoc.data();
        const { token } = tokenDoc.data();
        const pollNotificationCount = getNotificationCount(notificationsCountDoc) + 1;

        const totalNotificationCount = (user.notifications || 0) + 1;
        setNotificationCount(t, userRef, notificationsRef, totalNotificationCount, pollNotificationCount);

        const message = createNotification(chatID, user, poll.data(), token, totalNotificationCount);
        return deliverNotification(message);
      })
  })
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