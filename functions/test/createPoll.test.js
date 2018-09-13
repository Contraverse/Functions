const { assert, use, request } = require('chai');
const chaiHttp = require('chai-http');
const { api } = require('../index');
const admin = require('firebase-admin');
const { removePoll } = require('./utils');

const { QUESTION, ANSWERS } = require('./testData');
use(chaiHttp);

describe('Create Poll', () => {
  var pollID;
  after(() => {
    if (pollID)
      return removePoll(pollID);
    else
      console.log('pollID not set');
  });

  it('should create a poll', () => {
    const db = admin.firestore();
    const target = Array(ANSWERS.length).fill(0);

    return request(api)
      .post('/polls')
      .set('Accept', 'application/json')
      .send({ question: QUESTION, answers: ANSWERS })
      .then(res => {
        assert.equal(res.status, 200);
        pollID = res.body.pollID;
        const pollRef = db.doc(`Polls/${pollID}`);
        const resultsRef = db.doc(`Results/${pollID}`);
        return pollRef.get()
          .then(doc => {
            const poll = doc.data();
            assert.equal(poll.title, QUESTION);
            assert.equal(poll.pending, true);
            assert.deepEqual(poll.answers, ANSWERS);
            return resultsRef.get();
          }).then(doc => {
            assert.deepEqual(doc.data().counts, target);
            return true;
          })
      })
  })
});


