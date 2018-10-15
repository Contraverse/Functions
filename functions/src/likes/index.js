const { param, query } = require('express-validator/check');
const { validateUserID } = require('../auth');
const { like, dislike } = require('./methods');
const { hasLiked, hasNotLiked } = require('./middleware');
const { validateRequest } = require('../validators');

module.exports = function (app) {
  app.post('/debates/:debateID/likes', [
    validateUserID,
    param('debateID').exists(),
    query('messageID').exists(),
    validateRequest,
    hasNotLiked
  ], (req, res) => {
    const { userID } = req;
    const { debateID } = req.params;
    const { messageID } = req.query;
    return like(userID, debateID, messageID)
      .then(likes => res.status(200).json({ likes }));
  });

  app.delete('/debates/:debateID/likes', [
    validateUserID,
    param('debateID').exists(),
    query('messageID').exists(),
    validateRequest,
    hasLiked
  ], (req, res) => {
    const { userID } = req;
    const { debateID } = req.params;
    const { messageID } = req.query;
    return dislike(userID, debateID, messageID)
      .then(likes => res.status(200).json({ likes }));
  })
};



