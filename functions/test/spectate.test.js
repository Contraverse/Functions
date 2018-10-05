const chai = require('chai');
const chaiHttp = require('chai-http');
const admin = require('firebase-admin');
const { api } = require('..');
const { createDocument, removeDocument, removePoll, generateAuthHeader } = require('./utils');

chai.use(chaiHttp);
const { assert, request } = chai;
const { USER_ID, OPPONENT_ID } = require('./testData');

describe('Spectate', () => {
  let POLL_ID = 'FAKE_POLL_ID';

  before(() => {
    const batch = admin.firestore().batch();

    createDocument(batch, `Polls/${POLL_ID}`);
    createDocument(batch, `Profiles/${USER_ID}`);
    createDocument(batch, `Profiles/${OPPONENT_ID}`);

    return batch.commit();
  });

  after(() => {
    return removePoll(POLL_ID);
  });

  describe('Edge Cases', () => {
    it('should return 401 without auth header', () => {
      return request(api)
        .get(`/polls/${POLL_ID}/spectate`)
        .then(res => {
          assert.equal(res.status, 401);
        });
    })
  });

  describe('Test without active debate', () => {
    it('should not find a spectate', () => {
      return request(api)
        .get(`/polls/${POLL_ID}/spectate`)
        .set('Authorization', generateAuthHeader(USER_ID))
        .then(res => {
          assert.equal(res.status, 204);
        })
    })
  });

  describe('Test with an active debate', () => {
    let DOC_ID, spectateRef;
    before(() => {
      const db = admin.firestore();
      const batch = db.batch();

      const doc = db.collection('Debates').doc();
      DOC_ID = doc.id;
      spectateRef = db.doc(`Profiles/${USER_ID}/Spectates/${DOC_ID}`);
      batch.set(doc, {
        pollID: POLL_ID,
        users: {
          [OPPONENT_ID]: { test: true }
        }
      });
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
        .set('Authorization', generateAuthHeader(USER_ID))
        .then(res => {
          assert.equal(res.status, 200);
          assert.equal(res.body.spectateID, DOC_ID);
        })
    });

    it('should not return a debate that a user is in', () => {
      return request(api)
        .get(`/polls/${POLL_ID}/spectate`)
        .set('Authorization', generateAuthHeader(OPPONENT_ID))
        .then(res => {
          assert.equal(res.status, 204);
        })
    });

    it('should subscribe to a debate', () => {
      return request(api)
        .post(`/spectates/${DOC_ID}`)
        .set('Authorization', generateAuthHeader(USER_ID))
        .then(res => {
          assert.equal(res.status, 200);
          return spectateRef.get()
            .then(doc => assert.isTrue(doc.data().active))
        })
    });

    it('should return 401 on incomplete subscribe request', () => {
      return request(api)
        .post(`/spectates/${DOC_ID}`)
        .then(res => {
          assert.equal(res.status, 401);
        })
    });

    describe('Unsubscribe', () => {
      before(() => {
        return spectateRef.set({ active: true })
      });

      it('should unsubscribe to a debate', () => {
        return request(api)
          .delete(`/spectates/${DOC_ID}`)
          .set('Authorization', generateAuthHeader(USER_ID))
          .then(res => {
            assert(res.status, 200);
            return spectateRef.get()
              .then(doc => assert.isFalse(doc.exists));
          })
      })
    })
  })
});