const chai = require('chai');
const chatHttp = require('chai-http');
const { api } = require('..');
const admin = require('firebase-admin');
const { removePoll, removeUser } = require('./utils');
const { createPoll } = require('../src/polls/methods');
const { createUser } = require('../src/users/methods');

const { QUESTION, ANSWERS, USER_ID, AVATAR, USERNAME } = require('./testData');
chai.use(chatHttp);
const { assert, request } = chai;

describe('Case Vote', () => {
  var pollID;

  before(() => {
    return Promise.all([
      createPoll(QUESTION, ANSWERS)
        .then(id => pollID = id),
      createUser(USER_ID, AVATAR, USERNAME)
    ]);
  });

  after(() => {
    return Promise.all([
      removePoll(pollID),
      removeUser(USER_ID)
    ]);
  });

  it('should case a vote', () => {
    const answer = 0;
    const db = admin.firestore();
    const userRef = db.doc(`Profiles/${USER_ID}`);
    const totalVotesRef = db.doc(`Results/${pollID}`);
    const targetVotes = [1, 0];

    return request(api)
      .put(`/polls/${pollID}`)
      .query({ userID: USER_ID, answer })
      .set('Accept', 'application/json')
      .then((res) => {
        assert.equal(res.status, 200);
        return Promise.all([
          userRef.collection('Polls').doc(pollID).get(),
          totalVotesRef.get(),
        ]).then(docs => {
          const userPolls = docs[0].data();
          assert.deepEqual(userPolls, { answer });

          const totalVotes = docs[1].data();
          assert.deepEqual(totalVotes.counts, targetVotes);
        })
      })
  })
});