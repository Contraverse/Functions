const { assert } = require('chai');
const admin = require('firebase-admin');
const request = require('supertest');
const { api } = require('../index');
const { removeDocument } = require('./utils');

const { USER_ID } = require('./testData');

describe('Spectate', () => {
  var POLL_ID = 'FAKE_POLL_ID';

  describe('Test without active debate', () => {
    it('should not find a spectate', () => {
      return request(api)
        .get(`/polls/${POLL_ID}/spectate`)
        .expect(204);
    })
  });

  describe('Test with an active debate', () => {
    var DOC_ID, spectateRef;
    before(() => {
      const db = admin.firestore();
      const doc = db.collection('Debates').doc();
      return doc.set({ pollID: POLL_ID })
        .then(() => {
          DOC_ID = doc.id;
          spectateRef = db.doc(`Profiles/${USER_ID}/Spectates/${DOC_ID}`);
        });
    });

    after(() => {
      const db = admin.firestore();
      const debateRef = db.doc(`Debates/${DOC_ID}`);
      const userRef = db.doc(`Profiles/${USER_ID}`);
      return Promise.all([
        removeDocument(debateRef),
        removeDocument(userRef),
        removeDocument(spectateRef),
      ])
    });

    it('should return a valid debate ID', () => {
      return request(api)
        .get(`/polls/${POLL_ID}/spectate`)
        .then(res => {
          assert.equal(res.status, 200);
          assert.equal(res.text, DOC_ID);
        })
    });

    it('should subscribe to a debate', () => {
      return request(api)
        .post(`/spectates/${DOC_ID}`)
        .query({ userID: USER_ID })
        .then(res => {
          assert.equal(res.status, 200);
          return spectateRef.get()
            .then(doc => assert.isTrue(doc.data().active))
        })
    });

    it('should return 422 on incomplete subscribe request', () => {
      return request(api)
        .post(`/spectates/${DOC_ID}`)
        .expect(422)
    });

    describe('Unsubscribe', () => {
      before(() => {
        return spectateRef.set({ active: true })
      });

      it('should unsubscribe to a debate', () => {
        return request(api)
          .delete(`/spectates/${DOC_ID}`)
          .query({ userID: USER_ID })
          .then(res => {
            assert(res.status, 200);
            return spectateRef.get()
              .then(doc => assert.isFalse(doc.exists));
          })
      })
    })
  })
});