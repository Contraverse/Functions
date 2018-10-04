const { param, query, validationResult } = require('express-validator/check');
const { validateUserID } = require('../auth');
const { like, dislike } = require('./methods');

module.exports = function (app) {
  app.post('/debates/:debateID/likes', [
    validateUserID,
    param('debateID').exists(),
    query('messageID').exists()
  ], (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    }

    const { userID } = req;
    const { debateID } = req.params;
    const { messageID } = req.query;
    return like(userID, debateID, messageID, 1)
      .then(likes => res.status(200).json({ likes }));
  });

  app.delete('/debates/:debateID/likes', [
    validateUserID,
    param('debateID').exists(),
    query('messageID').exists()
  ], (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    }
    const { userID } = req;
    const { debateID } = req.params;
    const { messageID } = req.query;
    return dislike(userID, debateID, messageID, -1)
      .then(likes => res.status(200).json({ likes }));
  })
};



