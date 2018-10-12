const { param, validationResult } = require('express-validator/check');
const { clearNotifications } = require('./methods');
const { validateUserID } = require('../../auth');
const { isValidDebate } = require('../../validators');

module.exports = function (app) {
  app.post('/debates/:debateID/notifications', [
    validateUserID,
    param('debateID').exists().custom(isValidDebate)
  ], (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    }

    const { debateID } = req.params;
    const { userID } = req;

    return clearNotifications(debateID, userID)
      .then(() => res.status(200).send('OK'));
  });
};