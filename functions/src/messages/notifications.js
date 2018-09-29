const admin = require('firebase-admin');

module.exports = function (app) {
  return app.document('Debates/{debateID}/Messages/{messageID}')
    .onCreate((snap, context) => {
      return sendNotification(context.params.debateID, snap.data());
    })
};

function sendNotification(debateID, message) {
  const db = admin.firestore();
  return db.doc(`Debates/${debateID}`).get()
    .then(doc => {
      const { users } = doc.data();
      const opponentID = getOpponentID(users, message.userID);
      return db.doc(`Tokens/${opponentID}`).get()
    })
    .then(doc => {
      const { token } = doc.data();
      const body = createNotification(debateID, message, token);
      return admin.messaging().send(body);
    })
}

function getOpponentID(users, userID) {
  const keys = Object.keys(users);
  return keys[0] === userID ? keys[1] : keys[0];
}

function createNotification(debateID, message, token) {
  const notification = {
    title: 'New Message',
    body: message.text
  };

  const data = {
    type: 'chat',
    debateId: debateID
  };

  const apns = {
    payload: {
      aps: {
        badge: 1,
        sound: 'default'
      }
    }
  };

  return { notification, data, apns, token };
}