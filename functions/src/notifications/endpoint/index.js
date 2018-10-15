const { param } = require('express-validator/check');
const { clearNotifications } = require('./methods');
const { validateUserID } = require('../../auth');
const { isValidDebate, validateRequest } = require('../../validators');

module.exports = function (app) {
  app.post('/debates/:debateID/notifications', [
    validateUserID,
    param('debateID').exists().custom(isValidDebate),
    validateRequest
  ], (req, res) => {
    const { debateID } = req.params;
    const { userID } = req;

    return clearNotifications(debateID, userID)
      .then(() => res.status(200).send('OK'));
  });
};