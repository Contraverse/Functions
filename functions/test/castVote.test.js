const chai = require('chai');
const chaiHttp = require('chai-http');
const { api } = require('..');
const admin = require('firebase-admin');
const { removePoll, removeUser, generateAuthHeader } = require('./utils');
const { createPoll } = require('../src/polls/methods');
const { createUser } = require('../src/users/methods');

const { QUESTION, ANSWERS, USER_ID, AVATAR, USERNAME } = require('./testData');
chai.use(chaiHttp);
const { assert, request } = chai;

describe('Case Vote', () => {
  let pollID;

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
      .set('Accept', 'application/json')
      .set('Authorization', generateAuthHeader(USER_ID))
      .query({ answer })
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
  });

  it('should return an error when a invalid pollID is sent', () => {
    return request(api)
      .delete(`/polls/INVALID-POLL-ID`)
      .set('Accept', 'application/json')
      .set('Authorization', generateAuthHeader(USER_ID))
      .then(res => {
        assert.equal(res.status, 422);
      })
  });

  it('should clear the vote', () => {
    const db = admin.firestore();
    const targetVotes = [0, 0];
    const userVotesRef = db.doc(`Profiles/${USER_ID}/Polls/${pollID}`);
    const totalVotesRef = db.doc(`Results/${pollID}`);

    return request(api)
      .delete(`/polls/${pollID}`)
      .set('Accept', 'application/json')
      .set('Authorization', generateAuthHeader(USER_ID))
      .then(res => {
        assert.equal(res.status, 200);

        return db.getAll(userVotesRef, totalVotesRef)
      })
      .then(([userVotesDoc, totalVotesDoc]) => {
        assert.isFalse(userVotesDoc.exists);
        assert.deepEqual(totalVotesDoc.data().counts, targetVotes);
      })
  });

  it('should return an error when a user has not voted but tried to clear their votes', () => {
    return request(api)
      .delete(`/polls/${pollID}`)
      .set('Accept', 'application/json')
      .set('Authorization', generateAuthHeader(USER_ID))
      .then(res => {
        assert.equal(res.status, 403);
      })
  })
});