const admin = require('firebase-admin');
const express = require('express');
const bodyParser = require('body-parser');
const { projectConfig } = require('../config/firebase');
const auth = require('../config/auth');

projectConfig.credential = admin.credential.cert(auth);
admin.initializeApp(projectConfig);

module.exports = function (testing = false) {
  const app = express();
  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({ extended: true }));

  require('./admin')(app, testing);
  require('./debates')(app, testing);
  require('./feedback')(app, testing);
  require('./likes')(app, testing);
  require('./messages')(app, testing);
  require('./notifications/endpoint')(app, testing);
  require('./polls')(app, testing);
  require('./spectates')(app, testing);
  require('./users')(app, testing);

  return app;
};