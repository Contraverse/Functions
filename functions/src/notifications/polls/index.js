const { sendNotification } = require('./methods');

module.exports = function (app) {
  return app.document('Debates/{debateID}')
    .onCreate((snap, context) => {
      const debate = snap.data();
      const userIDs = Object.keys(debate.users);
      const { pollID } = debate;
      const { debateID } = context.params;
      return Promise.all(userIDs.map(userID => sendNotification(debateID, userID, pollID)));
    })
};