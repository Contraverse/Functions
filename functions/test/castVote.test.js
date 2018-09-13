const { assert } = require('chai');
const request = require('supertest');
const { app } = require('..');
const admin = require('firebase-admin');
const { removePoll, removeUser } = require('./utils');
const { createPoll } = require('../src/polls/methods');

const { QUESTION, ANSWERS, USER_ID } = require('./testData');

describe('Case Vote', () => {
  var pollID;

  before(() => {
    return createPoll(QUESTION, ANSWERS)
      .then(id => pollID = id);
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

    return request(app)
      .put(`/polls/${pollID}`)
      .query({ userID: USER_ID, answer })
      .set('Accept', 'application/json')
      .expect(200, () => {
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