const { assert } = require('chai');
const request = require('supertest');
const { app } = require('..');
const admin = require('firebase-admin');
const { removePoll } = require('./utils');

const QUESTION = 'What is your favorite color';
const ANSWERS = ['Red', 'Blue'];

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
    const pollRef = db.doc(`Polls/${pollID}`);
    const resultsRef = db.doc(`Results/${pollID}`);
    const target = Array(ANSWERS.length).fill(0);

    return request(app)
      .post('/polls')
      .set('Accept', 'application/json')
      .send({ question: QUESTION, answers: ANSWERS })
      .expect(200, (err, res) => {
        pollID = res.pollID;
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


