const { param, body, validationResult } = require('express-validator/check');
const { createUser, updateUser, getRandomAvatar, updateToken, deleteToken } = require('./methods');
const { isValidUser, validateRequest } = require('../validators');

module.exports = function (app) {
  app.post('/users', [
    body('userID').exists(),
    body('username').exists(),
    validateRequest
  ], (req, res) => {
    const { userID, username } = req.body;
    return getRandomAvatar()
      .then(avatar => createUser(userID, avatar, username))
      .then(() => res.status(200).send('OK'));
  });

  app.put('/users/:userID',
    param('userID').exists().custom(isValidUser),
    validateRequest,
    (req, res) => {
      const { userID } = req.params;
      const { avatar, username } = req.body;

      return updateUser(userID, avatar, username)
        .then(() => res.status(200).send('OK'));
    });

  app.post('/users/:userID/notifications', [
    param('userID').exists().custom(isValidUser),
    body('token').exists(),
    validateRequest
  ], (req, res) => {
    const { userID } = req.params;
    const { token } = req.body;

    return updateToken(userID, token)
      .then(() => res.status(200).send('OK'));
  });


  app.delete('/users/:userID/notifications', [
    param('userID').exists().custom(isValidUser),
    validateRequest
  ], (req, res) => {
    const { userID } = req.params;

    return deleteToken(userID)
      .then(() => res.status(200).send('OK'));
  })
};