const { assert, use, request } = require('chai');
const admin = require('firebase-admin');
const chaiHttp = require('chai-http');
const { api } = require('..');
const { findDebate } = require('../src/debates/debates');
const { createPoll } = require('../src/polls/methods');
const { createUser } = require('../src/users/methods');
const { createDocument, removePoll, removeUser } = require('./utils');

const { QUESTION, ANSWERS, USER_ID, AVATAR, USERNAME, OPPONENT_ID } = require('./testData');
use(chaiHttp);

describe('Debates', () => {
  var POLL_ID;
  before(() => {
    return Promise.all([
      createPoll(QUESTION, ANSWERS),
      createUser(USER_ID, AVATAR, USERNAME),
      createUser(OPPONENT_ID, AVATAR, USERNAME),
    ]).then(results => POLL_ID = results[0]);
  });

  after(() => {
    return Promise.all([
      removePoll(POLL_ID),
      removeUser(USER_ID),
      removeUser(OPPONENT_ID)
    ]);
  });

  describe('Test Queue', () => {
    var answer = 0;
    after(() => {
      return admin.firestore()
        .doc(`Polls/${POLL_ID}/Queue${answer}/${USER_ID}`)
        .delete();
    });

    it('should add a user to the queue', () => {
      const db = admin.firestore();

      return request(api)
        .post('/debates')
        .query({ pollID: POLL_ID, userID: USER_ID, category: answer })
        .then(res => {
          assert.equal(res.status, 204);
          return db.collection(`Polls/${POLL_ID}/Queue${answer}`).get()
            .then(snapshot => {
              const queue = snapshot.docs;
              assert.equal(queue.length, 1);
              assert.equal(queue[0].id, USER_ID);
            })
        })

    })
  });

  describe('Test Debate Room', () => {
    var answer = 0;
    var opponentAnswer = 1;

    before(() => {
      const db = admin.firestore();
      const batch = db.batch();
      createDocument(batch, `Profiles/${USER_ID}`);
      createDocument(batch, `Profiles/${OPPONENT_ID}`);
      batch.set(db.doc(`Polls/${POLL_ID}`), { question: QUESTION, answers: ANSWERS });

      return Promise.all([
        findDebate(USER_ID, POLL_ID, answer),
        batch.commit()
      ]);
    });

    after(() => {
      const db = admin.firestore();
      const batch = db.batch();
      batch.delete(db.doc(`Profiles/${USER_ID}`));
      batch.delete(db.doc(`Profiles/${OPPONENT_ID}`));
      batch.delete(db.doc(`Polls/${POLL_ID}`));
      return db.collection('Debates')
        .where('pollID', '==', POLL_ID).get()
        .then(snapshot => {
          snapshot.forEach(doc => batch.delete(doc.ref));
          return batch.commit();
        })
    });

    it('should create a debate room', () => {
      const db = admin.firestore();
      const profiles = db.collection('Profiles');
      return request(api)
        .post('/debates')
        .query({ pollID: POLL_ID, userID: OPPONENT_ID, category: opponentAnswer })
        .then(res => {
          assert.equal(res.status, 200);
          return Promise.all([
            db.collection('Debates').where('pollID', '==', POLL_ID).get(),
            profiles.doc(USER_ID).get(),
            profiles.doc(OPPONENT_ID).get()
          ]).then(([snapshot, user, opponent]) => {
            const debates = snapshot.docs;
            assert.equal(debates.length, 1);

            const debate = debates[0].data();
            assert.equal(debate.pollID, POLL_ID);
            assert.equal(debate.lastMessage, "New Debate!");
            assert.deepEqual(debate.users, { [USER_ID]: user.data(), [OPPONENT_ID]: opponent.data() });
            return true;
          });
        })
    })
  });

  describe('Test Errors', () => {
    const answer = 0, fakeUserID = 'FAKE_USER_ID';

    it('should return an error with invalid userID', () => {
      return request(api)
        .post('/debates')
        .query({ pollID: POLL_ID, userID: fakeUserID, category: answer })
        .then(res => {
          assert.equal(res.status, 422);
        })
    })
  })
});