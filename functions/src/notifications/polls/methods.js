const admin = require('firebase-admin');
const { sendFCMNotification, getNotificationCount, setNotificationCount, getAPNSConfig } = require('../utils');

function sendNotification(chatID, pollID, userID, opponentID, { deliverNotification = sendFCMNotification } = {}) {
  const db = admin.firestore();
  const userRef = db.doc(`Profiles/${userID}`);
  const opponentRef = db.doc(`Profiles/${opponentID}`);
  const notificationsRef = db.doc(`Profiles/${userID}/Notifications/${chatID}`);
  const pollRef = db.doc(`Polls/${pollID}`);
  const tokenRef = db.doc(`Tokens/${userID}`);

  return db.runTransaction(t => {
    return t.getAll(userRef, opponentRef, notificationsRef, pollRef, tokenRef)
      .then(([userDoc, opponentDoc, notificationsCountDoc, pollDoc, tokenDoc]) => {
        const user = userDoc.data();
        const { token } = tokenDoc.data();
        const pollNotificationCount = getNotificationCount(notificationsCountDoc) + 1;

        const totalNotificationCount = (user.notifications || 0) + 1;
        setNotificationCount(t, userRef, notificationsRef, totalNotificationCount, pollNotificationCount);

        const message = createNotification(chatID, opponentDoc.data(), pollDoc.data(), token, totalNotificationCount);
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

  const apns = getAPNSConfig(notificationCount);

  console.log('Notification', notification, apns, data, token);
  return { notification, apns, data, token };
}

module.exports = { sendNotification };