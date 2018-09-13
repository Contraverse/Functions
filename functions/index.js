const express = require('express');
const bodyParser = require('body-parser');
const functions = require('firebase-functions');

const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
require('./src/debates')(app);
require('./src/feedback')(app);
require('./src/likes')(app);
require('./src/messages')(app);
require('./src/polls')(app);
require('./src/spectates')(app);
require('./src/users')(app);

exports.api = functions.https.onRequest(app);
