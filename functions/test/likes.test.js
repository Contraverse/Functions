const { assert } = require('chai');
const admin = require('firebase-admin');
const { removeDocument } = require('./utils');
const { likeMessage } = require('../src/likes');

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
  })

  after(() => {
    const ref = admin.firestore().doc(`Debates/${DEBATE_ID}`);
    return removeDocument(ref);
  })

  it('should like a message', () => {
    return likeMessage(DEBATE_ID, MESSAGE_ID)
      .then(() => getRef().get())
      .then(doc => assert.equal(doc.data().likes, 1));
  })

  function getRef() {
    const db = admin.firestore();
    return db.doc(`Debates/${DEBATE_ID}/Messages/${MESSAGE_ID}`);
  }
})