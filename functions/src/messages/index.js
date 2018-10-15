const { param, body } = require('express-validator/check');
const { sendMessages, formatMessages } = require('./methods');
const { isValidDebate, validateRequest } = require('../validators');

module.exports = function (app) {
  app.post('/debates/:debateID/messages', [
    param('debateID').exists().custom(isValidDebate),
    body('messages').exists()
      .customSanitizer(messages => formatMessages(messages)),
    validateRequest
  ], (req, res) => {
    const { debateID } = req.params;
    const { messages } = req.body;

    return sendMessages(debateID, messages)
      .then(() => res.status(200).send('OK'));
  })
};