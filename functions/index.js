const admin = require('firebase-admin');
const functions = require('firebase-functions');
const {
  debate,
  debates,
  spectate,
  polls,
  likes,
  messages,
  feedback,
  users,
  spectates
} = require('./src');

admin.initializeApp();

exports.debate = functions.https.onRequest(debate);
exports.debates = functions.https.onRequest(debates);
exports.spectate = functions.https.onRequest(spectate);
exports.spectates = functions.https.onRequest(spectates);
exports.polls = functions.https.onRequest(polls);
exports.likes = functions.https.onRequest(likes);
exports.messages = functions.https.onRequest(messages);
exports.feedback = functions.https.onRequest(feedback);
exports.users = functions.https.onRequest(users);
