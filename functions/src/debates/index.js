const { query, param } = require('express-validator/check');
const { validateUserID } = require('../auth');
const { getDebates, findDebate } = require('./debates');
const { getDebate, leaveDebate } = require('./debate');
const { isValidPoll, isValidAnswer, isValidDebate, validateRequest } = require('../validators');

module.exports = function (app) {

  app.get('/debates',
    validateUserID,
    (req, res) => {
      const { userID } = req;

      return getDebates(userID)
        .then(result => res.status(200).send(result))
    });

  app.post('/debates', [
    validateUserID,
    query('pollID').exists().custom(isValidPoll),
    query('category').exists().custom(isValidAnswer),
    validateRequest
  ], (req, res) => {
    const { userID } = req;
    const { pollID, category } = req.query;

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
    param('debateID').exists().custom(isValidDebate),
    validateRequest,
    (req, res) => {
      const { debateID } = req.params;
      return getDebate(debateID)
        .then(result => res.status(200).send(result));
    });

  app.delete('/debates/:debateID', [
    validateUserID,
    param('debateID').exists().custom(isValidDebate),
    validateRequest
  ], (req, res) => {
    const { debateID } = req.params;
    const { userID } = req;
    return leaveDebate(userID, debateID)
      .then(() => res.status(200).send('OK'));
  });
};