const admin = require('firebase-admin');

module.exports = function (req, res, next) {
  const authHeader = req.get('authorization');
  if (isValidAuthHeader(authHeader)) {
    const userID = authHeader.split('Bearer ')[1];
    return admin.firestore()
      .doc(`Profiles/${userID}`).get()
      .then(doc => {
        if (doc.exists) {
          req.userID = userID;
          return next();
        }
        else {
          return failRequest(res);
        }
      })
  }
  else {
    return failRequest(res);
  }
};

function failRequest(res) {
  return res.status(401).send('Unauthorized');
}

function isValidAuthHeader(header) {
  return header && header.startsWith('Bearer ');
}