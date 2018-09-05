const admin = require('firebase-admin');
const functions = require('firebase-functions');
const {
  findDebate,
  castVote,
  findSpectate,
  leaveConversation,
  createPoll,
  polls,
  likes,
  messages,
  feedback
} = require('./src');

admin.initializeApp();

exports.helloWorld = functions.https.onRequest((request, response) => {
  response.send("Hello from Firebase!");
});

exports.findDebate = functions.https.onRequest(findDebate);
exports.castVote = functions.https.onRequest(castVote);
exports.findSpectate = functions.https.onRequest(findSpectate);
exports.leaveConversation = functions.https.onRequest(leaveConversation);
exports.createPoll = functions.https.onRequest(createPoll);
exports.polls = functions.https.onRequest(polls);
exports.likes = functions.https.onRequest(likes);
exports.messages = functions.https.onRequest(messages);
exports.feedback = functions.https.onRequest(feedback);
