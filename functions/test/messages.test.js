const { assert } = require('chai');
const admin = require('firebase-admin');
const { removeDocument } = require('./utils');
const { sendMessages } = require('../src/messages');

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
  })

  afterEach(() => {
    const ref = admin.firestore()
      .doc(`Debates/${DEBATE_ID}`);
    return removeDocument(ref);
  })

  it('should send messages', () => {
    return testSendMessage(MESSAGES);
  })

  it('should send a single message', () => {
    return testSendMessage([MESSAGES[0]]);
  })

  function testSendMessage(messages) {
    return sendMessages(DEBATE_ID, messages)
      .then(() => {
        const db = admin.firestore();
        const ref = db.collection(`Debates/${DEBATE_ID}/Messages`);
        return ref.get();
      })
      .then(snapshot => {
        const result = snapshot.docs.map(doc => doc.data())
        assert.deepEqual(result, messages)
      });
  }

})