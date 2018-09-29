const { assert, use, request } = require('chai');
const admin = require('firebase-admin');
const chaiHttp = require('chai-http');
const { api } = require('..');
const { createUser } = require('../src/users/methods');
const { setupChatroom } = require('../src/debates/debates');
const { removeUser, removeDocument } = require('./utils');

const { USER_ID, OPPONENT_ID, AVATAR, USERNAME } = require('./testData');
use(chaiHttp);

describe('Debate', () => {
  const POLL_ID = 'FAKE_POLL_ID';
  var CHAT_ID, REF;
  before(() => {
    const user = createUser(USER_ID, AVATAR, USERNAME);
    const opponent = createUser(OPPONENT_ID, AVATAR, USERNAME);
    return Promise.all([user, opponent])
      .then(() => {
        const db = admin.firestore();
        return db.runTransaction(t => {
          return setupChatroom(t, db, USER_ID, OPPONENT_ID, POLL_ID)
            .then(chatID => {
              CHAT_ID = chatID;
              console.log(chatID);
              REF = db.doc(`Debates/${chatID}`);
            });
        })
      })
  });

  after(() => {
    const user = removeUser(USER_ID);
    const opponent = removeUser(OPPONENT_ID);
    const debate = removeDocument(REF);
    return Promise.all([user, opponent, debate]);
  });

  it('should leave the debate', () => {
    return request(api)
      .delete(`/debates/${CHAT_ID}`)
      .query({ userID: USER_ID })
      .then(res => {
        assert.equal(res.status, 200);
        return REF.get()
          .then(doc => {
            const users = Object.keys(doc.data().users);
            assert.equal(users.length, 1);
          })
      })
  });

  it('should delete the empty room', () => {
    return request(api)
      .delete(`/debates/${CHAT_ID}`)
      .query({ userID: OPPONENT_ID })
      .then(res => {
        assert.equal(res.status, 200);
        return REF.get()
          .then(doc => assert.isFalse(doc.exists))
      })
  })
});
