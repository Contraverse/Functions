const admin = require('firebase-admin');

module.exports = function (app) {
  return app.document('Debates/{debateID}')
    .onCreate((snap, context) => {
      const userIDs = Object.keys(snap.data().users);
      const { debateID, pollID } = context.params;

      return Promise.all(userIDs.map(userID => sendNotification(debateID, userID, pollID)));
    })
};

function sendNotification(chatID, userID, pollID) {
  const db = admin.firestore();
  const userRef = db.doc(`Profiles/${userID}`);
  const pollRef = db.doc(`Polls/${pollID}`);
  const tokenRef = db.doc(`Tokens/${userID}`);
  return Promise.all([
    userRef.get(),
    pollRef.get(),
    tokenRef.get()
  ]).then(([user, poll, tokenDoc]) => {
    const token = tokenDoc.data().token;
    const message = createNotification(chatID, user.data(), poll.data(), token);
    return admin.messaging().send(message);
  })
}

function createNotification(chatID, user, poll, token) {
  const data = {
    type: 'debate',
    debateId: chatID,
    poll: {
      id: poll.id,
      question: poll.title
    }
  };

  const notification = {
    title: 'Debate Found!',
    body: `Starting Debate with ${user.username}`
  };

  const apns = {
    payload: {
      aps: {
        badge: 1,
        sound: 'default'
      }
    }
  };

  return { notification, apns, data, token };
}