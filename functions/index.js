const { https, firestore } = require('firebase-functions');
const app = require('./src')();

exports.api = https.onRequest(app);
exports.chatNotifications = require('./src/messages/notifications')(firestore);
exports.debateNotifications = require('./src/debates/notifications')(firestore);
exports.userUpdateHandler = require('./src/users/background').updateUserDocsInDebates(firestore);
