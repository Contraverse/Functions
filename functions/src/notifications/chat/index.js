const { sendNotification } = require('./methods');

module.exports = function (app) {
  return app.document('Debates/{debateID}/Messages/{messageID}')
    .onCreate((snap, context) => {
      const { debateID } = context.params;
      return sendNotification(debateID, snap.data());
    })
};