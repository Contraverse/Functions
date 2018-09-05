const { assert } = require('chai');
const admin = require('firebase-admin');
const { removeDocument } = require('./utils');
const { getSpectate, setSpectate, removeSpectate } = require('../src/spectate');

const { USER_ID } = require('./testData');

describe('Spectate', () => {
  var POLL_ID = 'FAKE_POLL_ID';

  describe('Test without active debate', () => {
    it('should not find a spectate', () => {
      return getSpectate(USER_ID, POLL_ID)
        .then(result => {
          assert.isNull(result);
          return true;
        })
    })
  });

  describe('Test with an active debate', () => {
    var DOC_ID;
    before(() => {
      const doc = admin.firestore()
        .collection('Debates').doc();
      return doc.set({ pollID: POLL_ID })
        .then(() => DOC_ID = doc.id);
    });

    after(() => {
      const db = admin.firestore();
      const debateRef = db.doc(`Debates/${DOC_ID}`);
      const userRef = db.doc(`Profiles/${USER_ID}`);
      return Promise.all([
        removeDocument(debateRef),
        removeDocument(userRef)
      ])
    });

    it('should return a valid debate ID', () => {
      return getSpectate(USER_ID, POLL_ID)
        .then(result => {
          assert.equal(result, DOC_ID);
          return true;
        })
    });

    it('should subscribe to a debate', () => {
      const spectateRef = admin.firestore()
        .doc(`Profiles/${USER_ID}/Spectates/${DOC_ID}`);
      return setSpectate(USER_ID, DOC_ID)
        .then(() => spectateRef.get())
        // Assert
        .then(doc => assert.isTrue(doc.data().active));
    })

    it('should unsubscribe to a debate', () => {
      // Arrange
      const spectateRef = admin.firestore()
        .doc(`Profiles/${USER_ID}/Spectates/${DOC_ID}`);
      // Act
      return spectateRef.set({ active: true })
        .then(() => removeSpectate(USER_ID, DOC_ID))
        .then(() => spectateRef.get())
        // Assert
        .then(doc => assert.isFalse(doc.exists));
    })
  })
});