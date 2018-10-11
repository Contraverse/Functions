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

module.exports = { sendFCMNotification, getNotificationCount, setNotificationCount };