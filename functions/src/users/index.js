const { param, body, validationResult } = require('express-validator/check');
const { createUser, updateUser, getRandomAvatar } = require('./methods');

module.exports = function (app) {
  app.post('/users', [
    body('userID').exists(),
    body('username').exists()
  ], (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    }

    const { userID, username } = req.body;
    return getRandomAvatar()
      .then(avatar => createUser(userID, avatar, username))
      .then(() => res.status(200).send('OK'));
  });

  app.put('/users/:userID', param('userID').exists(),
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