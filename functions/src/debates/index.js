const { query, param, validationResult } = require('express-validator/check');
const { getDebates, findDebate } = require('./debates');
const { getDebate, leaveDebate } = require('./debate');

module.exports = function (app) {
  app.get('/debates',
    query('userID').exists(),
    (req, res) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(422).json({ errors: errors.array() });
      }

      const { userID } = req.query;

      return getDebates(userID)
        .then(result => res.status(200).send(result))
    });

  app.post('/debates', [
    query('userID').exists(),
    query('pollID').exists(),
    query('category').exists()
  ], (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    }

    const { userID, pollID, category } = req.query;
    return findDebate(userID, pollID, category)
      .then(result => {
        if (result.found) {
          const { opponentID, chatID } = result;
          return res.status(200).send({ opponentID, chatID });
        }
        return res.status(204).send('OK');
      });
  });

  app.get('/debates/:debateID',
    param('debateID').exists(),
    (req, res) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(422).json({ errors: errors.array() });
      }

      const { debateID } = req.params;
      return getDebate(debateID)
        .then(result => res.status(200).send(result));
    });

  app.delete('/debates/:debateID', [
    param('debateID').exists(),
    query('userID').exists()
  ], (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    }

    const { debateID } = req.params;
    const { userID } = req.query;
    return leaveDebate(userID, debateID)
      .then(() => res.status(200).send('OK'));
  });
};