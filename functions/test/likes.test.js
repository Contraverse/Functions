const { assert } = require('chai');
const request = require('supertest');
const admin = require('firebase-admin');
const { app } = require('../index');
const { removeDocument } = require('./utils');

describe('Likes', () => {
  const DEBATE_ID = 'FAKE_DEBATE_ID';
  var MESSAGE_ID = 'FAKE_MESSAGE_ID';

  before(() => {
    const ref = getRef();
    MESSAGE_ID = ref.id;
    return ref.set({
        text: 'Hello World',
        likes: 0
      });
  });

  after(() => {
    const ref = admin.firestore().doc(`Debates/${DEBATE_ID}`);
    return removeDocument(ref);
  });

  it('should like a message', () => {
    return request(app)
      .post(`/debates/${DEBATE_ID}/likes`)
      .query({ messageID: MESSAGE_ID })
      .expect(200, () => {
        return getRef().get()
          .then(doc => assert.equal(doc.data().likes, 1))
      });
  });

  it('should send 422 for without full data', () => {
    return request(app)
      .post(`/debates/${DEBATE_ID}/likes`)
      .expect(422);
  });

  function getRef() {
    const db = admin.firestore();
    return db.doc(`Debates/${DEBATE_ID}/Messages/${MESSAGE_ID}`);
  }
});