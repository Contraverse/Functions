const chai = require('chai');
const admin = require('firebase-admin');
const chaiHttp = require('chai-http');
const { api } = require('..');
const { removeDocument } = require('./utils');

const { MESSAGES } = require('./testData');
chai.use(chaiHttp);
const { assert, request } = chai;

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
    return request(api)
      .post(`/debates/${DEBATE_ID}/messages`)
      .send({ messages })
      .set('Accept', 'application/json')
      .then(res => {
        assert(res.status, 200);
        return ref.get()
          .then(snapshot => {
            const result = snapshot.docs.map(doc => doc.data());
            result.sort((a, b) => a.createdAt.localeCompare(b.createdAt));
            const target = messages.map(chat => Object.assign({ likes: 0 }, chat));
            assert.deepEqual(result, target)
          })
      })
  }

});