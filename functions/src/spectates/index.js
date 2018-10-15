const { param, validationResult } = require('express-validator/check');
const { validateUserID } = require('../auth');
const { getSpectate, setSpectate, removeSpectate } = require('./methods');
const { isValidPoll, isValidDebate, validateRequest } = require('../validators');

module.exports = function (app) {
  app.get('/polls/:pollID/spectate', [
    validateUserID,
    param('pollID').exists().custom(isValidPoll),
    validateRequest
  ], (req, res) => {
    const { userID } = req;
    const { pollID } = req.params;
    return getSpectate(userID, pollID)
      .then(spectateID => {
        if (spectateID)
          return res.status(200).json({ spectateID });
        return res.status(204).send('Spectate not found');
      });
  });

  app.post('/spectates/:chatID', [
    validateUserID,
    param('chatID').exists().custom(isValidDebate),
    validateRequest
  ], (req, res) => {
    const { userID } = req;
    const { chatID } = req.params;

    return setSpectate(userID, chatID)
      .then(() => res.status(200).send('OK'));
  });

  app.delete('/spectates/:chatID', [
    validateUserID,
    param('chatID').exists().custom(isValidDebate),
    validateRequest
  ], (req, res) => {
    const { userID } = req;
    const { chatID } = req.params;

    return removeSpectate(userID, chatID)
      .then(() => res.status(200).send('OK'));
  })
};