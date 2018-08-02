const { assert } = require('chai');
const admin = require('firebase-admin');

const projectConfig = {
  projectId: 'controverse-f770c',
  databaseURL: 'https://controverse-f770c.firebaseio.com'
};

const test = require('firebase-functions-test')(projectConfig, 'config/auth.json');
const findSpectate = require('../src/findSpectate')._findSpectate;

const { USER_ID } = require('./testData');

describe('Find Spectate', () => {
  var pollID = 'FAKE_POLL_ID';

  after(() => {
    test.cleanup();
  });

  describe('Test without active debate', () => {
    it('should not find a spectate', () => {
      return findSpectate(USER_ID, pollID)
        .then(({ found }) => {
          assert.isFalse(found);
          return true;
        })
    })
  });

  describe('Test with an active debate', () => {
    var docID;
    before(() => {
      const doc = admin.firestore()
        .collection('Debates').doc();
      return doc.set({ pollID })
        .then(() => docID = doc.id);
    });

    after(() => {
      return admin.firestore()
        .doc(`Debates/${docID}`)
        .delete();
    });

    it('should return a valid debate ID', () => {
      return findSpectate(USER_ID, pollID)
        .then(({ found, chatID }) => {
          assert.isTrue(found);
          assert.equal(chatID, docID);
          return true;
        })
    })
  })
});