const { param, query, body, validationResult } = require('express-validator/check');
const { castVote, getPolls, createPoll } = require('./methods');

module.exports = function (app) {
  app.put('/polls/:pollID', [
    param('pollID').exists(),
    query('userID').exists(),
    query('answer').exists().toInt(),
  ], (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    }

    const { userID, answer } = req.query;
    const { pollID } = req.params;
    return castVote(userID, pollID, answer)
      .then(result => res.status(200).json(result));
  });

  app.get('/polls', (req, res) => {
    return getPolls()
      .then(result => res.status(200).send(result));
  });

  app.post('/polls', [
    body('question').exists(),
    body('answers').exists()
  ], (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    }

    const { question, answers } = req.body;
    return createPoll(question, answers)
      .then(pollID => res.status(200).json({ pollID }));
  });
};