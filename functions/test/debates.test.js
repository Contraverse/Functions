const { assert, use, request } = require('chai');
const admin = require('firebase-admin');
const chaiHttp = require('chai-http');
const { api } = require('../index');
const { findDebate } = require('../src/debates/debates');
const { createPoll } = require('../src/polls/methods');
const { createUser } = require('../src/users/methods');
const { removePoll, removeUser } = require('./utils');

const { QUESTION, ANSWERS, USER_ID, AVATAR, USERNAME, OPPONENT_ID } = require('./testData');
use(chaiHttp);

describe('Debates', () => {
  var pollID;
  before(() => {
    return Promise.all([
      createPoll(QUESTION, ANSWERS),
      createUser(USER_ID, AVATAR, USERNAME),
      createUser(OPPONENT_ID, AVATAR, USERNAME),
    ]).then(results => pollID = results[0]);
  });

  after(() => {
    return Promise.all([
      removePoll(pollID),
      removeUser(USER_ID),
      removeUser(OPPONENT_ID)
    ]);
  });

  describe('Test Queue', () => {
    var answer = 0;
    after(() => {
      return admin.firestore()
        .doc(`Polls/${pollID}/Queue${answer}/${USER_ID}`)
        .delete();
    });

    it('should add a user to the queue', () => {
      const db = admin.firestore();

      return request(api)
        .post('/debates')
        .query({ pollID, userID: USER_ID, category: answer })
        .then(res => {
          assert.equal(res.status, 204);
          return db.collection(`Polls/${pollID}/Queue${answer}`).get()
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
      return findDebate(USER_ID, pollID, answer);
    });

    after(() => {
      const db = admin.firestore();
      return db.collection('Debates')
        .where('pollID', '==', pollID).get()
        .then(snapshot => {
          const batch = db.batch();
          snapshot.forEach(doc => batch.delete(doc.ref));
          return batch.commit();
        })
    });

    it('should create a debate room', () => {
      const db = admin.firestore();
      const profiles = db.collection('Profiles');
      return request(api)
        .post('/debates')
        .query({ pollID, userID: OPPONENT_ID, category: opponentAnswer })
        .then(res => {
          assert.equal(res.status, 200);
          return Promise.all([
            db.collection('Debates').where('pollID', '==', pollID).get(),
            profiles.doc(USER_ID).get(),
            profiles.doc(OPPONENT_ID).get()
          ]).then(([snapshot, user, opponent]) => {
            const debates = snapshot.docs;
            assert.equal(debates.length, 1);

            const debate = debates[0].data();
            assert.equal(debate.pollID, pollID);
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
        .query({ pollID, userID: fakeUserID, category: answer })
        .then(res => {
          assert.equal(res.status, 422);
        })
    })
  })
});