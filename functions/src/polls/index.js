const { param, query, body } = require('express-validator/check');
const { validateUserID } = require('../auth');
const { castVote, clearVote, getPolls, createPoll } = require('./methods');
const { isValidPoll, validateRequest } = require('../validators');
const { hasVoted } = require('./middleware');

module.exports = function (app) {
  app.put('/polls/:pollID', [
    validateUserID,
    param('pollID').exists().custom(isValidPoll),
    query('answer').exists().toInt(),
    validateRequest
  ], (req, res) => {
    const { userID } = req;
    const { answer } = req.query;
    const { pollID } = req.params;
    return castVote(userID, pollID, answer)
      .then(result => res.status(200).json(result));
  });

  app.delete('/polls/:pollID', [
    validateUserID,
    param('pollID').exists().custom(isValidPoll),
    validateRequest,
    hasVoted,
  ], (req, res) => {
    const { userID } = req;
    const { pollID } = req.params;
    return clearVote(userID, pollID)
      .then(result => res.status(200).json(result));
  });

  app.get('/polls', (req, res) => {
    return getPolls()
      .then(result => res.status(200).send(result));
  });

  app.post('/polls', [
    body('question').exists(),
    body('answers').exists(),
    validateRequest
  ], (req, res) => {
    const { question, answers } = req.body;
    return createPoll(question, answers)
      .then(pollID => res.status(200).json({ pollID }));
  });
};