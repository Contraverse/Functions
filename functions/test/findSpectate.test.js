const { assert } = require('chai');
const admin = require('firebase-admin');
const { removeDocument } = require('./utils');

const projectConfig = {
  projectId: 'controverse-f770c',
  databaseURL: 'https://controverse-f770c.firebaseio.com'
};

const findSpectate = require('../src/findSpectate')._findSpectate;

const { USER_ID } = require('./testData');

describe('Find Spectate', () => {
  var pollID = 'FAKE_POLL_ID';

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
      const db = admin.firestore();
      const debateRef = db.doc(`Debates/${docID}`);
      const userRef = db.doc(`Profiles/${USER_ID}`);
      return Promise.all([
        removeDocument(debateRef),
        removeDocument(userRef)
      ])
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