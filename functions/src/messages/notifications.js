const admin = require('firebase-admin');

module.exports = function (app) {
  return app.document('Debates/{debateID}/Messages/{messageID}')
    .onCreate((snap, context) => {
      return sendNotification(context.params.debateID, snap.data());
    })
};

function sendNotification(debateID, message) {
  const db = admin.firestore();
  let opponentUsername = null;
  return db.doc(`Debates/${debateID}`).get()
    .then(doc => {
      const { users, pollID } = doc.data();
      const opponentID = getOpponentID(users, message.userID);
      opponentUsername = users[opponentID].username;
      const tokenRef = db.doc(`Tokens/${opponentID}`);
      const pollRef = db.doc(`Polls/${pollID}`);
      return db.getAll(tokenRef, pollRef);
    })
    .then(([token, poll]) => {
      const body = createNotification(debateID, message, poll.data().title, opponentUsername, token.data().token);
      return admin.messaging().send(body);
    })
}

function getOpponentID(users, userID) {
  const keys = Object.keys(users);
  return keys[0] === userID ? keys[1] : keys[0];
}

function createNotification(debateID, message, question, username, token) {
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
        badge: 1,
        sound: 'default'
      }
    }
  };

  return { notification, data, apns, token };
}