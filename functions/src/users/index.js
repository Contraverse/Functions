const { param, body, validationResult } = require('express-validator/check');
const { createUser, updateUser } = require('./methods');

module.exports = function (app) {
  app.post('/users', [
    body('userID').exists(),
    body('avatar').exists(),
    body('username').exists()
  ], (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    }

    const { userID, avatar, username } = req.body;
    return createUser(userID, avatar, username)
      .then(() => res.status(200).send('OK'));
  });

  app.put('/user/:userID', param('userID').exists(),
    (req, res) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(422).json({ errors: errors.array() });
      }

      const { userID } = req.params;
      const { avatar, username } = req.body;
      return updateUser(userID, avatar, username)
        .then(() => res.status(200).send('OK'));
    })
};