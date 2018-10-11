const admin = require('firebase-admin');
const { sendFCMNotification, getNotificationCount, setNotificationCount } = require('../utils');

function sendNotification(debateID, message, { deliverNotification = sendFCMNotification }) {
  const db = admin.firestore();
  const debateRef = db.doc(`Debates/${debateID}`);


  let opponentUsername = null;
  let notificationsRef = null;
  let userRef = null;

  return db.runTransaction(t => {
    return t.get(debateRef)
      .then(doc => {
        const { users, pollID } = doc.data();
        const opponentID = getOpponentID(users, message.userID);
        opponentUsername = users[opponentID].username;

        userRef = db.doc(`Profiles/${opponentID}`);
        notificationsRef = db.doc(`Profiles/${opponentID}/Notifications/${debateID}`);
        const tokenRef = db.doc(`Tokens/${opponentID}`);
        const pollRef = db.doc(`Polls/${pollID}`);

        return t.getAll(userRef, notificationsRef, tokenRef, pollRef);
      })
      .then(([userDoc, notificationsCountDoc, tokenDoc, pollDoc]) => {
        const user = userDoc.data();
        const pollQuestion = pollDoc.data().title;
        const { token } = tokenDoc.data();
        const debateNotificationCount = getNotificationCount(notificationsCountDoc) + 1;

        const totalNotificationCount = (user.notifications || 0) + 1;
        setNotificationCount(t, userRef, notificationsRef, totalNotificationCount, debateNotificationCount);

        const body = createNotification(debateID, message, pollQuestion, opponentUsername, totalNotificationCount, token);
        return deliverNotification(body);
      })
  });
}

function getOpponentID(users, userID) {
  const keys = Object.keys(users);
  return keys[0] === userID ? keys[1] : keys[0];
}

function createNotification(debateID, message, question, username, totalNotificationCount, token) {
  const notification = {
    title: `${username}: ${question}`,
    body: message.text
  };

  const data = {
    type: 'chat',
    debateId: debateID
  };

  const apns = {
    payload: {
      aps: {
        badge: totalNotificationCount,
      }
    }
  };

  return { notification, data, apns, token };
}

module.exports = { sendNotification };