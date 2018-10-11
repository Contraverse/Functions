const { https, firestore } = require('firebase-functions');
const app = require('./src')();

exports.api = https.onRequest(app);
exports.chatNotifications = require('./src/notifications/chat')(firestore);
exports.debateNotifications = require('./src/notifications/polls')(firestore);
exports.userUpdateHandler = require('./src/users/background').updateUserDocsInDebates(firestore);
