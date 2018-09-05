const { assert } = require('chai');
const admin = require('firebase-admin');
const { removePoll } = require('./utils');
const { createPoll } = require('../src/polls');

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
    return createPoll(QUESTION, ANSWERS)
      .then(id => {
        pollID = id;
        const db = admin.firestore();
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
            const target = Array(ANSWERS.length).fill(0);
            assert.deepEqual(doc.data().counts, target);
            return true;
          })
      })
  })
});


