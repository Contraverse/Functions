const { assert } = require('chai');
const admin = require('firebase-admin');
const request = require('supertest');
const { app } = require('..');
const { removeDocument } = require('./utils');

const { MESSAGES } = require('./testData');

describe('Messages', () => {
  const DEBATE_ID = 'FAKE_DEBATE_ID';

  beforeEach(() => {
    const ref = admin.firestore()
      .doc(`Debates/${DEBATE_ID}`);
    return ref.set({
      createdAt: 'today',
      lastMessage: 'New Debate!'
    })
  });

  afterEach(() => {
    const ref = admin.firestore()
      .doc(`Debates/${DEBATE_ID}`);
    return removeDocument(ref);
  });

  it('should send messages', () => {
    return testSendMessage(MESSAGES);
  });

  it('should send a single message', () => {
    return testSendMessage([MESSAGES[0]]);
  });

  function testSendMessage(messages) {
    const ref = admin.firestore()
      .collection(`Debates/${DEBATE_ID}/Messages`);
    return request(app)
      .post(`/debates/${DEBATE_ID}/messages`)
      .send({ messages })
      .set('Accept', 'application/json')
      .expect(200, () => {
        return ref.get()
          .then(() => {
            const result = snapshot.docs.map(doc => doc.data());
            result.sort((a, b) => a.createdAt.localeCompare(b.createdAt));
            assert.deepEqual(result, messages)
          })
      })
  }

});