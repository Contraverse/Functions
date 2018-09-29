const { param, body, validationResult } = require('express-validator/check');
const { sendMessages, formatMessages } = require('./methods');
const { isValidDebate } = require('../validators');

module.exports = function (app) {
  app.post('/debates/:debateID/messages', [
    param('debateID').exists().custom(isValidDebate),
    body('messages').exists()
      .customSanitizer(messages => formatMessages(messages))
  ], (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).send(errors.array());
    }

    const { debateID } = req.params;
    const { messages } = req.body;

    return sendMessages(debateID, messages)
      .then(() => res.status(200).send('OK'));
  })
};