const admin = require('firebase-admin');
const express = require('express');
const bodyParser = require('body-parser');
const functions = require('firebase-functions');
const { projectConfig } = require('./config/firebase');
const auth = require('./config/auth');

projectConfig.credential = admin.credential.cert(auth);
admin.initializeApp(projectConfig);

const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
require('./src/admin')(app);
require('./src/debates')(app);
require('./src/feedback')(app);
require('./src/likes')(app);
require('./src/messages/index')(app);
require('./src/polls')(app);
require('./src/spectates')(app);
require('./src/users')(app);

exports.api = functions.https.onRequest(app);
exports.chatNotifications = require('./src/messages/notifications')(functions.firestore);
exports.debateNotifications = require('./src/debates/notifications')(functions.firestore);
