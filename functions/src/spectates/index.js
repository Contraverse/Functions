const { query, param, validationResult } = require('express-validator/check');
const { getSpectate, setSpectate, removeSpectate } = require('./methods');

module.exports = function (app) {
  app.get('/polls/:pollID/spectate', [
    param('pollID').exists()
  ], (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    }

    const { pollID } = req.params;
    return getSpectate(pollID)
      .then(spectateID => {
        if (spectateID)
          return res.status(200).json({ spectateID });
        return res.status(204).send('Spectate not found');
      });
  });

  app.post('/spectates/:chatID', [
    param('chatID').exists(),
    query('userID').exists()
  ], (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    }

    const { chatID } = req.params;
    const { userID } = req.query;
    return setSpectate(userID, chatID)
      .then(() => res.status(200).send('OK'));
  });

  app.delete('/spectates/:chatID', [
    param('chatID').exists(),
    query('userID').exists()
  ], (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    }

    const { chatID } = req.params;
    const { userID } = req.query;
    return removeSpectate(userID, chatID)
      .then(() => res.status(200).send('OK'));
  })
};