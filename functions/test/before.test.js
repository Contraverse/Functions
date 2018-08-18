const admin = require('firebase-admin');

const projectConfig = {
  projectId: 'controverse-f770c',
  databaseURL: 'https://controverse-f770c.firebaseio.com'
};

describe('Test setup', () => {
  it('should initialize firebase', () => {
    admin.initializeApp(projectConfig);
  })
})