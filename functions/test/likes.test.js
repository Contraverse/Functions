const chai = require('chai');
const chaiHttp = require('chai-http');
const admin = require('firebase-admin');
const { api } = require('../index');
const { removeDocument } = require('./utils');

chai.use(chaiHttp);
const { assert, request } = chai;

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
    return request(api)
      .post(`/debates/${DEBATE_ID}/likes`)
      .query({ messageID: MESSAGE_ID })
      .then(res => {
        assert.equal(res.status, 200);
        return getRef().get()
          .then(doc => assert.equal(doc.data().likes, 1));
      });
  });

  it('should send 422 for without full data', done => {
    request(api)
      .post(`/debates/${DEBATE_ID}/likes`)
      .end((err, res) => {
        assert.equal(res.status, 422);
        done();
      })
  });

  function getRef() {
    const db = admin.firestore();
    return db.doc(`Debates/${DEBATE_ID}/Messages/${MESSAGE_ID}`);
  }
});