const chai = require('chai');
const chaiHttp = require('chai-http');
const admin = require('firebase-admin');
const { api } = require('..');
const { removeDocument, removeUser, generateAuthHeader } = require('./utils');

chai.use(chaiHttp);
const { assert, request } = chai;
const { USER_ID } = require('./testData');

describe('Likes', () => {
  const DEBATE_ID = 'FAKE_DEBATE_ID';
  const db = admin.firestore();
  let MESSAGE_ID = null;

  before(() => {
    const db = admin.firestore();
    const batch = db.batch();

    batch.set(db.doc(`Profiles/${USER_ID}`), { test: true });

    const ref = getRef();
    MESSAGE_ID = ref.id;
    batch.set(ref, {
      text: 'Hello World',
      likes: 0
    });

    return batch.commit();
  });

  after(() => {
    const ref = admin.firestore().doc(`Debates/${DEBATE_ID}`);
    return Promise.all([
      removeDocument(ref),
      removeUser(USER_ID)
    ]);
  });

  it('should like a message', () => {
    return request(api)
      .post(`/debates/${DEBATE_ID}/likes`)
      .set('Authorization', generateAuthHeader(USER_ID))
      .query({ messageID: MESSAGE_ID })
      .then(res => {
        assert.equal(res.status, 200);
        return db.getAll(
          getRef(),
          getRef().collection('Likes').doc(USER_ID));
      }).then(([messageDoc, likeDoc]) => {
        assert.equal(messageDoc.data().likes, 1);
        assert.isTrue(likeDoc.exists);
      })
  });

  it('should dislike a message', () => {
    return request(api)
      .delete(`/debates/${DEBATE_ID}/likes`)
      .set('Authorization', generateAuthHeader(USER_ID))
      .query({ messageID: MESSAGE_ID })
      .then(res => {
        assert.equal(res.status, 200);
        return db.getAll(
          getRef(),
          getRef().collection('Likes').doc(USER_ID))
      }).then(([messageDoc, likeDoc]) => {
        assert.equal(messageDoc.data().likes, 0);
        assert.isFalse(likeDoc.exists);
      })
  });

  it('should send 422 for without Authorization', () => {
    return request(api)
      .post(`/debates/${DEBATE_ID}/likes`)
      .then(res => {
        assert.equal(res.status, 401);
      })
  });

  function getRef() {
    const db = admin.firestore();
    return db.doc(`Debates/${DEBATE_ID}/Messages/${MESSAGE_ID}`);
  }
});