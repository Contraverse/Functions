const admin = require('firebase-admin');

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

function getAPNSConfig(badge = 1) {
  return {
    payload: {
      aps: {
        badge,
        sound: 'default'
      }
    }
  };
}

module.exports = { sendFCMNotification, getNotificationCount, setNotificationCount, getAPNSConfig };