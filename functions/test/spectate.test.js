const { assert } = require('chai');
const admin = require('firebase-admin');
const request = require('supertest');
const { api } = require('..');
const { createDocument, removeDocument, removePoll } = require('./utils');

const { USER_ID } = require('./testData');

describe('Spectate', () => {
  var POLL_ID = 'FAKE_POLL_ID';

  before(() => {
    return createDocument(`Polls/${POLL_ID}`);
  });

  after(() => {
    return removePoll(POLL_ID);
  });

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
      const batch = db.batch();

      const doc = db.collection('Debates').doc();
      DOC_ID = doc.id;
      spectateRef = db.doc(`Profiles/${USER_ID}/Spectates/${DOC_ID}`);
      batch.set(doc, { pollID: POLL_ID });

      createDocument(batch, `Profiles/${USER_ID}`);

      return batch.commit();
    });

    after(() => {
      const db = admin.firestore();
      const debateRef = db.doc(`Debates/${DOC_ID}`);
      return Promise.all([
        removeDocument(debateRef),
        removeDocument(spectateRef),
      ])
    });

    it('should return a valid debate ID', () => {
      return request(api)
        .get(`/polls/${POLL_ID}/spectate`)
        .then(res => {
          assert.equal(res.status, 200);
          assert.equal(res.body.spectateID, DOC_ID);
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