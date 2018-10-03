const { param, body, validationResult } = require('express-validator/check');
const basicAuth = require('express-basic-auth');
const adminUsers = require('../../config/adminUsers');
const { removePoll, acceptPoll } = require('./methods');
const { createPoll } = require('../polls/methods');

module.exports = function (app) {
  app.use(['/admin', '/admin*'], basicAuth({ users: adminUsers }));
  app.post('/admin/polls', [
    body('question').exists(),
    body('answers').exists()
  ], (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    }

    const { question, answers } = req.body;
    return createPoll(question, answers, false)
      .then(pollID => res.status(200).json({ pollID }));
  });

  app.put('/admin/polls/:pollID', [
    param('pollID').exists(),
    body('question').exists(),
    body('answers').exists()
  ], (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    }

    const { pollID } = req.params;
    const { question, answers } = req.body;

    return acceptPoll(pollID, question, answers)
      .then(() => res.status(200).send('OK'));
  });

  app.delete('/admin/polls/:pollID', [
    param('pollID').exists()
  ], (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    }

    const { pollID } = req.params;
    return removePoll(pollID)
      .then(() => res.status(200).send('OK'));
  });

  app.get('/admin', (req, res) => {
    return res.status(200).send('Welcome to Admin!');
  })
};