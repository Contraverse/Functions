const admin = require('firebase-admin');

function hasNotLiked(req, res, next) {
  return _hasLiked(req)
    .then(hasLiked => {
      if (hasLiked) {
        return res.status(403).send('User has already liked');
      }
      return next();
    })
}

function hasLiked(req, res, next) {
  return _hasLiked(req)
    .then(hasLiked => {
      if (hasLiked) {
        return next();
      } else {
        return res.status(403).send('User has not liked');
      }
    })
}

function _hasLiked(req) {
  const { userID } = req;
  const { debateID } = req.params;
  const { messageID } = req.query;

  return admin.firestore()
    .doc(`Debates/${debateID}/Messages/${messageID}/Likes/${userID}`)
    .get()
    .then(doc => doc.exists);
}

module.exports = { hasLiked, hasNotLiked };