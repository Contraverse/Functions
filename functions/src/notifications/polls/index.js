const { sendNotification } = require('./methods');

module.exports = function (app) {
  return app.document('Debates/{debateID}')
    .onCreate((snap, context) => {
      const debate = snap.data();
      const [userID, opponentID] = Object.keys(debate.users);
      const { pollID } = debate;
      const { debateID } = context.params;
      return Promise.all([
        sendNotification(debateID, pollID, userID, opponentID),
        sendNotification(debateID, pollID, opponentID, userID),
      ]);
    })
};